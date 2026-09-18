// 画像圧縮ユーティリティ (Canvas API のみ使用、外部ライブラリ不要)

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };
    img.src = url;
  });
}

async function resizeToBlob(img, maxDim, quality) {
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
  });
}

// 元画像から本体写真(最大1280px)とサムネイル(最大320px)の2種類を生成
export async function compressImage(file) {
  const img = await loadImage(file);
  const full = await resizeToBlob(img, 1280, 0.75);
  const thumb = await resizeToBlob(img, 320, 0.7);
  return { full, thumb, width: img.width, height: img.height };
}

export function blobToUrl(blob) {
  return URL.createObjectURL(blob);
}
