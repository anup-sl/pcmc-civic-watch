export function buildGrievanceEmail(params: {
  category: string;
  subTag: string;
  wardNo: number | string;
  locality: string;
  zone: string;
  notes?: string;
  timestamp: string;
  slaHours: number;
  slaDue: string;
  lat: number;
  lng: number;
  photoUrl: string;
  citizenEmail?: string;
}) {
  const subject = `[PCMC Grievance] Ward ${params.wardNo} — ${params.category} Issue at ${params.locality} (Action Requested)`;
  const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;max-width:640px;margin:auto;padding:16px;color:#1f2937;">
    <h2 style="color:#0ea5e9;">PCMC CivicWatch - Grievance Notice</h2>
    <p><strong>Category:</strong> ${params.category} — ${params.subTag}</p>
    <p><strong>Ward:</strong> ${params.wardNo} | <strong>Locality:</strong> ${params.locality} | <strong>Zone:</strong> ${params.zone}</p>
    <p><strong>Reported:</strong> ${params.timestamp} | <strong>SLA:</strong> ${params.slaHours} hours (due ${params.slaDue})</p>
    <p><strong>Citizen description:</strong> ${params.notes || 'N/A'}</p>
    <p><strong>GPS:</strong> ${params.lat}, ${params.lng} <a href="https://maps.google.com/?q=${params.lat},${params.lng}">Open in Google Maps</a></p>
    <p><strong>Evidence:</strong> <img src="${params.photoUrl}" alt="watermarked evidence" style="max-width:100%;border:1px solid #e5e7eb;border-radius:8px;"/></p>
    <p>Formal municipal inspection requested.</p>
    <hr/>
    <p style="font-size:12px;color:#6b7280;">Sent by PCMC CivicWatch. Reply to citizen: ${params.citizenEmail || 'N/A'}.</p>
  </body></html>`;
  return { subject, html };
}