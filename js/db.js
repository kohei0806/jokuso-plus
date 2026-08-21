// IndexedDB ラッパー (外部ライブラリ不使用・端末内保存のみ)

const DB_NAME = 'jokusoplus';
const DB_VERSION = 1;

let dbPromise = null;

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = req.result;
      if (!db.objectStoreNames.contains('patients')) {
        const store = db.createObjectStore('patients', { keyPath: 'id', autoIncrement: true });
        store.createIndex('name', 'name');
      }
      if (!db.objectStoreNames.contains('records')) {
        const store = db.createObjectStore('records', { keyPath: 'id', autoIncrement: true });
        store.createIndex('patientId', 'patientId');
        store.createIndex('patientId_date', ['patientId', 'date']);
      }
      if (!db.objectStoreNames.contains('photos')) {
        const store = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        store.createIndex('recordId', 'recordId');
        store.createIndex('patientId_date', ['patientId', 'date']);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(storeNames, mode) {
  return openDb().then((db) => db.transaction(storeNames, mode));
}

function wrap(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const Patients = {
  async add(patient) {
    const t = await tx('patients', 'readwrite');
    const store = t.objectStore('patients');
    const data = { ...patient, createdAt: Date.now() };
    const id = await wrap(store.add(data));
    return id;
  },
  async update(patient) {
    const t = await tx('patients', 'readwrite');
    await wrap(t.objectStore('patients').put(patient));
  },
  async get(id) {
    const t = await tx('patients', 'readonly');
    return wrap(t.objectStore('patients').get(Number(id)));
  },
  async all() {
    const t = await tx('patients', 'readonly');
    const result = await wrap(t.objectStore('patients').getAll());
    return result.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));
  },
  async remove(id) {
    const t = await tx(['patients', 'records', 'photos'], 'readwrite');
    t.objectStore('patients').delete(Number(id));
    const recIndex = t.objectStore('records').index('patientId');
    const recs = await wrap(recIndex.getAll(Number(id)));
    for (const r of recs) {
      t.objectStore('records').delete(r.id);
    }
    const photoStore = t.objectStore('photos');
    const allPhotos = await wrap(photoStore.getAll());
    for (const p of allPhotos) {
      if (p.patientId === Number(id)) photoStore.delete(p.id);
    }
    return new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  },
};

export const Records = {
  async add(record) {
    const t = await tx('records', 'readwrite');
    const data = { ...record, createdAt: Date.now() };
    const id = await wrap(t.objectStore('records').add(data));
    return id;
  },
  async update(record) {
    const t = await tx('records', 'readwrite');
    await wrap(t.objectStore('records').put(record));
  },
  async get(id) {
    const t = await tx('records', 'readonly');
    return wrap(t.objectStore('records').get(Number(id)));
  },
  async byPatient(patientId) {
    const t = await tx('records', 'readonly');
    const idx = t.objectStore('records').index('patientId');
    const result = await wrap(idx.getAll(Number(patientId)));
    return result.sort((a, b) => a.date.localeCompare(b.date));
  },
  async remove(id) {
    const t = await tx(['records', 'photos'], 'readwrite');
    t.objectStore('records').delete(Number(id));
    const photoStore = t.objectStore('photos');
    const idx = photoStore.index('recordId');
    const photos = await wrap(idx.getAll(Number(id)));
    for (const p of photos) photoStore.delete(p.id);
    return new Promise((resolve, reject) => {
      t.oncomplete = () => resolve();
      t.onerror = () => reject(t.error);
    });
  },
};

export const Photos = {
  async add(photo) {
    const t = await tx('photos', 'readwrite');
    const id = await wrap(t.objectStore('photos').add(photo));
    return id;
  },
  async byRecord(recordId) {
    const t = await tx('photos', 'readonly');
    const idx = t.objectStore('photos').index('recordId');
    const result = await wrap(idx.getAll(Number(recordId)));
    return result.sort((a, b) => (a.order || 0) - (b.order || 0));
  },
  async byPatient(patientId) {
    const t = await tx('photos', 'readonly');
    const store = t.objectStore('photos');
    const all = await wrap(store.getAll());
    return all
      .filter((p) => p.patientId === Number(patientId))
      .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  },
  async remove(id) {
    const t = await tx('photos', 'readwrite');
    await wrap(t.objectStore('photos').delete(Number(id)));
  },
};
