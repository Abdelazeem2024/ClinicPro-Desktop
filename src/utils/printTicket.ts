/**
 * طباعة تذكرة الدور - متوافقة مع الطابعات الحرارية 58mm / 80mm والعادية
 * تصميم بسيط يتكيف تلقائيًا مع عرض الورقة
 */
export interface TicketData {
  clinicName: string;
  queueNumber: number;
  remaining: number; // عدد المنتظرين قبله
  message?: string;
}

export function printQueueTicket(data: TicketData): void {
  const {
    clinicName,
    queueNumber,
    remaining,
    message = 'يرجى الانتظار حتى يتم النداء'
  } = data;

  const printWindow = window.open('', '_blank', 'width=400,height=600');
  if (!printWindow) {
    alert('يرجى السماح بالنوافذ المنبثقة لطباعة التذكرة');
    return;
  }

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <title>تذكرة الدور</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page {
      margin: 4mm;
      size: auto;
    }
    body {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      direction: rtl;
      text-align: center;
      color: #000;
      background: #fff;
      padding: 8px 4px;
      width: 100%;
      max-width: 80mm;
      margin: 0 auto;
    }
    .ticket {
      width: 100%;
    }
    .clinic-name {
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 10px;
      line-height: 1.3;
      word-wrap: break-word;
    }
    .divider {
      border: none;
      border-top: 1.5px dashed #333;
      margin: 8px 0;
    }
    .label {
      font-size: 12px;
      color: #333;
      margin-bottom: 4px;
    }
    .queue-number {
      font-size: 56px;
      font-weight: 800;
      line-height: 1;
      margin: 6px 0 10px;
      letter-spacing: -1px;
    }
    .remaining {
      font-size: 14px;
      font-weight: 600;
      margin: 8px 0;
    }
    .remaining span {
      font-size: 20px;
      font-weight: 800;
    }
    .message {
      font-size: 11px;
      color: #444;
      margin-top: 10px;
      line-height: 1.4;
    }
    .footer-line {
      margin-top: 12px;
      font-size: 10px;
      color: #666;
    }

    /* للطابعات الحرارية الضيقة 58mm */
    @media print {
      body {
        max-width: 100%;
        padding: 2mm;
      }
      .queue-number {
        font-size: 48px;
      }
      .clinic-name {
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="ticket">
    <div class="clinic-name">${escapeHtml(clinicName)}</div>
    <hr class="divider" />
    <div class="label">رقم الدور</div>
    <div class="queue-number">${queueNumber}</div>
    <hr class="divider" />
    <div class="remaining">
      المتبقي على دورك: <span>${remaining}</span>
    </div>
    <div class="message">${escapeHtml(message)}</div>
    <div class="footer-line">Clinic Pro</div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        setTimeout(function() { window.close(); }, 400);
      }, 200);
    };
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
