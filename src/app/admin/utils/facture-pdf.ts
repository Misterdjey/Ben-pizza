import jsPDF from 'jspdf';
import { Commande } from '../models';

export function generateFacturePdf(commande: Commande): void {
  const doc = new jsPDF();
  const orange = [255, 107, 53] as const;
  const charcoal = [26, 26, 26] as const;

  // En-tête
  doc.setFillColor(...orange);
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('BENJAMIN PIZZA', 15, 19);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Pizzaiolo à domicile', 15, 26);

  // Coordonnées Benjamin
  doc.setTextColor(...charcoal);
  doc.setFontSize(9);
  doc.text('Benjamin Chemla', 140, 38);
  doc.text('Paris, France', 140, 44);
  doc.text('benyochemla@gmail.com', 140, 50);

  // Titre facture
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...orange);
  doc.text('FACTURE', 15, 50);

  // Infos client
  doc.setTextColor(...charcoal);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Facturer à :', 15, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(commande.client?.nom ?? '', 15, 72);
  if (commande.client?.nom_entreprise) doc.text(commande.client.nom_entreprise, 15, 78);
  doc.text(commande.client?.email ?? '', 15, commande.client?.nom_entreprise ? 84 : 78);
  if (commande.client?.telephone) doc.text(commande.client.telephone, 15, 84);

  // Détails prestation
  const tableTop = 100;
  doc.setFillColor(245, 245, 245);
  doc.rect(15, tableTop - 6, 180, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Description', 17, tableTop);
  doc.text('Détail', 110, tableTop);
  doc.text('Montant', 175, tableTop, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  let y = tableTop + 10;

  doc.text('Prestation pizzaiolo à domicile', 17, y);
  doc.text(`le ${commande.date_presta}`, 110, y);
  doc.text(`${Number(commande.prix_total).toFixed(2)} €`, 195, y, { align: 'right' });
  y += 8;

  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Offre : ${commande.offre?.nom ?? ''}`, 17, y);
  doc.text(`${commande.nb_personnes} personnes`, 110, y);
  y += 6;

  if (commande.pizzas_realisees) {
    doc.text(`Pizzas réalisées : ${commande.pizzas_realisees}`, 17, y);
    y += 6;
  }

  // Ligne séparatrice
  doc.setDrawColor(...orange);
  doc.setLineWidth(0.5);
  doc.line(15, y + 4, 195, y + 4);
  y += 14;

  // Total
  doc.setTextColor(...charcoal);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL TTC', 130, y);
  doc.setTextColor(...orange);
  doc.text(`${Number(commande.prix_total).toFixed(2)} €`, 195, y, { align: 'right' });

  // Pied de page
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci pour votre confiance — Benjamin Pizza', 105, 280, { align: 'center' });

  const clientNom = (commande.client?.nom ?? 'client').replace(/\s+/g, '-').toLowerCase();
  doc.save(`facture-${clientNom}-${commande.date_presta}.pdf`);
}
