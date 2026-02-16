import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as QRCode from 'qrcode';

export type ReceiptData = {
  listingTitle: string;
  qtyKg: number;
  pickupTime: string;
  buyerName: string;
  fisherName: string;
  location: string;
  checkoutId?: string;
};

export const exportPickupReceipt = async (data: ReceiptData) => {
  const qrText = `DroPiPêche|${data.checkoutId ?? 'N/A'}|${data.listingTitle}|${data.qtyKg}|${data.pickupTime}|${data.buyerName}|${data.fisherName}`;
  const qrDataUrl = await QRCode.toDataURL(qrText, { margin: 1, width: 180 });

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0B1F24; }
          h1 { font-size: 20px; margin-bottom: 8px; }
          .meta { color: #6A7B80; margin-bottom: 16px; }
          .card { border: 1px solid #E1E7EA; border-radius: 12px; padding: 16px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { color: #6A7B80; font-size: 12px; }
          .value { font-weight: 600; }
          .qr { margin-top: 16px; display: flex; align-items: center; gap: 16px; }
          .qr img { width: 140px; height: 140px; }
          .qr-text { color: #6A7B80; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>Bon de retrait DroPiPêche</h1>
        <div class="meta">Généré le ${new Date().toLocaleString('fr-FR')}</div>
        <div class="card">
          <div class="row"><span class="label">Référence</span><span class="value">${data.checkoutId ?? '—'}</span></div>
          <div class="row"><span class="label">Produit</span><span class="value">${data.listingTitle}</span></div>
          <div class="row"><span class="label">Quantité</span><span class="value">${data.qtyKg} kg</span></div>
          <div class="row"><span class="label">Retrait</span><span class="value">${data.pickupTime}</span></div>
          <div class="row"><span class="label">Lieu</span><span class="value">${data.location}</span></div>
          <div class="row"><span class="label">Acheteur</span><span class="value">${data.buyerName}</span></div>
          <div class="row"><span class="label">Pêcheur</span><span class="value">${data.fisherName}</span></div>
          <div class="qr">
            <img src="${qrDataUrl}" />
            <div>
              <div class="label">QR de vérification</div>
              <div class="qr-text">Présentez ce QR au quai.</div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Bon de retrait DroPiPêche',
    });
  }
  return uri;
};

