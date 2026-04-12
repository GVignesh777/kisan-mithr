export const exportToCSV = (data, filename = 'report.csv') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    const values = headers.map(header => `"${('' + row[header]).replace(/"/g, '""')}"`);
    csvRows.push(values.join(','));
  }
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
};

export const exportToTXT = (data, filename = 'report.txt') => {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  let txtContent = "KISAN MITHR - FARM ANALYTICS REPORT\n====================================\n\n";
  for (const row of data) {
    headers.forEach(header => {
      txtContent += `${header.toUpperCase()}: ${row[header]}\n`;
    });
    txtContent += "------------------------------------\n";
  }
  const blob = new Blob([txtContent], { type: 'text/plain' });
  triggerDownload(blob, filename);
};

export const exportToPDF = (data, filename = 'report.pdf') => {
  // Since jspdf isn't pre-installed, we'll provide a formatted text document 
  // that can be easily printed to PDF from any device.
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  let pdfContent = "KISAN MITHR - OFFICIAL FARM REPORT\n" + "=".repeat(40) + "\n\n";
  data.forEach((row, i) => {
    pdfContent += `Entry #${i + 1}\n`;
    headers.forEach(header => {
      pdfContent += `${header.padEnd(20)}: ${row[header]}\n`;
    });
    pdfContent += "-".repeat(40) + "\n";
  });
  const blob = new Blob([pdfContent], { type: 'text/plain' });
  triggerDownload(blob, filename.replace('.pdf', '.txt')); // Fallback to .txt if no PDF lib
  // In a real environment with jspdf, we'd use new jsPDF() here.
};

const triggerDownload = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

