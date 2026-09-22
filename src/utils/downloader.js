/**
 * Robust file downloader for modern browsers (Chrome, Edge, Firefox, Safari)
 * Guarantees proper filename, extension (.pdf, .json), and prevents GUID blob naming.
 */
export function triggerFileDownload(blobOrData, fileName, mimeType = 'application/octet-stream') {
  try {
    let blob;
    if (blobOrData instanceof Blob) {
      // Ensure the blob has the expected MIME type
      blob = blobOrData.type === mimeType ? blobOrData : new Blob([blobOrData], { type: mimeType });
    } else if (typeof blobOrData === 'string') {
      blob = new Blob([blobOrData], { type: mimeType });
    } else {
      blob = new Blob([JSON.stringify(blobOrData, null, 2)], { type: mimeType });
    }

    // Clean filename: remove accents, spaces to underscores, and invalid filesystem characters
    const cleanFileName = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents (María -> Maria)
      .replace(/[/\\?%*:|"<>]/g, '_')   // Replace forbidden Windows characters
      .trim();

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = url;
    link.setAttribute('download', cleanFileName);
    link.setAttribute('target', '_self');

    // Crucial for Chrome and Edge: anchor MUST be in document.body to respect download attribute
    document.body.appendChild(link);
    link.click();

    // Clean up after download has started
    setTimeout(() => {
      try {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
        window.URL.revokeObjectURL(url);
      } catch (err) {
        // ignore
      }
    }, 2000);
  } catch (error) {
    console.error('Error triggering file download:', error);
    alert('No se pudo completar la descarga. Por favor intenta nuevamente.');
  }
}
