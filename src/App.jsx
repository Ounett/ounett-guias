import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Package,
  ReceiptText,
  BarChart3,
  Search,
  Plus,
  Printer,
  Trash2,
  Copy,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  Sparkles,
  Download,
} from "lucide-react";
import "./App.css";

const tabs = [
  { id: "guias", label: "Guías PDF", icon: Upload },
  { id: "envios", label: "Envíos internos", icon: Package },
  { id: "recibos", label: "Recibos", icon: ReceiptText },
  { id: "resumen", label: "Resumen", icon: BarChart3 },
];

const initialGuides = [
  {
    id: 1,
    guia: "KU765M00000",
    fecha: "2026-05-22",
    remitente: "Peletería Continental",
    destinatario: "Cliente ejemplo",
    destino: "Ciudad Capital",
    telefono: "2416-1549",
    descripcion: "Guía importada de ejemplo",
    monto: 25,
    estado: "Registrada",
    archivo: "Paquete-GUATEX.pdf",
  },
];

const initialInternal = [
  {
    id: 1,
    tipo: "Envío",
    subtipo: "Entrega interna",
    fecha: "2026-02-03",
    fechaInicio: "2026-02-03",
    fechaFin: "2026-02-03",
    incluyeSeptimo: false,
    empresa: "Peletería Continental",
    cliente: "Comercial COI S.A.",
    recibidoPor: "Cliente",
    concepto: "Mercadería pendiente de cancelar",
    factura: "8297",
    monto: 0,
    estado: "Pendiente",
    observaciones: "Se entrega mercadería y queda pendiente de pago.",
  },
  {
    id: 2,
    tipo: "Recibo",
    subtipo: "Préstamo",
    fecha: "2026-05-24",
    fechaInicio: "2026-05-24",
    fechaFin: "2026-05-24",
    incluyeSeptimo: true,
    empresa: "Peletería Continental",
    cliente: "Cliente ejemplo",
    recibidoPor: "Caja",
    concepto: "Préstamo de efectivo",
    factura: "",
    monto: 150,
    estado: "Pagado",
    observaciones: "Recibo interno de prueba.",
  },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function money(value) {
  const n = Number(value || 0);
  return `Q${n.toFixed(2)}`;
}

function defaultDocDraft(type = "Envío") {
  const isReceipt = type === "Recibo";

  return {
    tipo: type,
    subtipo: isReceipt ? "Préstamo" : "Entrega interna",
    fecha: today(),
    fechaInicio: today(),
    fechaFin: today(),
    incluyeSeptimo: isReceipt,
    empresa: "Peletería Continental",
    cliente: "",
    recibidoPor: "",
    concepto: isReceipt ? "Préstamo de efectivo" : "Mercadería pendiente de cancelar",
    factura: "",
    monto: "",
    estado: isReceipt ? "Pagado" : "Pendiente",
    observaciones: "",
  };
}

function escapeHtml(text) {
  return String(text ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getDocumentText(doc) {
  if (!doc) return [];

  if (doc.tipo === "Recibo" && doc.subtipo === "Préstamo") {
    return [
      `Yo, ${doc.cliente || "________________"}, hago constar que recibí de ${doc.empresa || "Peletería Continental"} la cantidad de ${money(doc.monto)} el día ${doc.fecha}.`,
      doc.observaciones ? `Observaciones: ${doc.observaciones}` : "",
    ].filter(Boolean);
  }

  if (doc.tipo === "Recibo") {
    const periodo = doc.subtipo?.replace("Pago ", "").toLowerCase() || "periodo";
    const septimo = doc.incluyeSeptimo ? ", incluyendo séptimo día" : "";

    return [
      `Yo, ${doc.cliente || "________________"}, hago constar que recibí de ${doc.empresa || "Peletería Continental"} el pago ${periodo} correspondiente del ${doc.fechaInicio} al ${doc.fechaFin}${septimo}.`,
      `Monto recibido: ${money(doc.monto)}.`,
      doc.observaciones ? `Observaciones: ${doc.observaciones}` : "",
    ].filter(Boolean);
  }

  return [
    `Para: ${doc.cliente || "________________"}.`,
    `Por este medio se deja constancia de: ${doc.concepto || "________________"}.`,
    doc.factura ? `No. factura relacionada: ${doc.factura}.` : "",
    Number(doc.monto) > 0 ? `Monto: ${money(doc.monto)}.` : "",
    doc.observaciones ? `Observaciones: ${doc.observaciones}` : "",
  ].filter(Boolean);
}

function openPrintWindow(doc) {
  if (!doc) return;

  const logoUrl = `${window.location.origin}/logo-peleteria.png`;
  const bodyLines = getDocumentText(doc)
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("");

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(doc.tipo)} - ${escapeHtml(doc.cliente || "Documento")}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #e5e7eb;
            font-family: Arial, Helvetica, sans-serif;
            color: #172033;
          }
          .page {
            position: relative;
            width: 8.5in;
            height: 5.5in;
            margin: 20px auto;
            padding: 0.35in;
            overflow: hidden;
            background: white;
            border: 1px solid #cbd5e1;
            box-shadow: 0 20px 60px rgba(15, 23, 42, 0.18);
          }
          .watermark {
            position: absolute;
            right: 18px;
            bottom: 22px;
            font-size: 42px;
            font-weight: 900;
            letter-spacing: -2px;
            color: rgba(15, 23, 42, 0.045);
            transform: rotate(-6deg);
          }
          .top {
            position: relative;
            z-index: 2;
            display: flex;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 14px;
            border-bottom: 3px solid #0f172a;
          }
          .brand-row {
            display: flex;
            align-items: center;
            gap: 14px;
          }
          .logo-box {
            width: 68px;
            height: 68px;
            display: grid;
            place-items: center;
            overflow: hidden;
            border-radius: 16px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
          }
          .logo-box img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
          }
          .brand {
            display: block;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #0891b2;
            font-weight: 900;
          }
          h1 {
            margin: 4px 0 0;
            font-size: 32px;
            color: #0f172a;
            letter-spacing: -1px;
          }
          .date-box {
            min-width: 150px;
            padding: 12px;
            border-radius: 14px;
            background: #0f172a;
            color: #f8fafc;
            text-align: center;
          }
          .date-box span {
            display: block;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #94a3b8;
          }
          .date-box strong {
            display: block;
            margin-top: 4px;
            font-size: 16px;
          }
          .body {
            position: relative;
            z-index: 2;
            margin-top: 24px;
            display: grid;
            gap: 10px;
            font-size: 19px;
            line-height: 1.55;
          }
          p { margin: 0; color: #1e293b; }
          strong { color: #020617; }
          .footer {
            position: relative;
            z-index: 2;
            display: grid;
            grid-template-columns: 1.4fr 0.8fr;
            gap: 18px;
            margin-top: 34px;
          }
          .signature {
            padding-top: 14px;
            border-top: 2px solid #0f172a;
          }
          .signature span {
            display: block;
            font-size: 11px;
            color: #475569;
            text-transform: uppercase;
            letter-spacing: 2px;
            font-weight: 900;
          }
          .signature strong {
            display: block;
            margin-top: 6px;
            color: #0f172a;
            font-size: 18px;
          }
          .credit {
            position: absolute;
            right: 22px;
            bottom: 14px;
            z-index: 3;
            color: #64748b;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 1px;
          }
          @page { size: 8.5in 5.5in landscape; margin: 0; }
          @media print {
            body { background: white; }
            .page {
              margin: 0;
              border: none;
              box-shadow: none;
              width: 8.5in;
              height: 5.5in;
            }
          }
        </style>
      </head>
      <body>
        <section class="page">
          <div class="watermark">Ounett</div>
          <div class="top">
            <div class="brand-row">
              <div class="logo-box">
                <img src="${logoUrl}" onerror="this.style.display='none'" />
              </div>
              <div>
                <span class="brand">${escapeHtml(doc.empresa || "Peletería Continental")}</span>
                <h1>${escapeHtml(doc.tipo)}${doc.subtipo ? ` · ${escapeHtml(doc.subtipo)}` : ""}</h1>
              </div>
            </div>
            <div class="date-box">
              <span>Fecha</span>
              <strong>${escapeHtml(doc.fecha)}</strong>
            </div>
          </div>

          <div class="body">${bodyLines}</div>

          <div class="footer">
            <div class="signature">
              <span>Recibido por</span>
              <strong>${escapeHtml(doc.recibidoPor || "________________")}</strong>
            </div>
            <div class="signature">
              <span>Estado</span>
              <strong>${escapeHtml(doc.estado)}</strong>
            </div>
          </div>

          <div class="credit">Developed by Ounett · Edwin Escobar</div>
        </section>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank", "width=950,height=650");

  if (!printWindow) {
    alert("El navegador bloqueó la ventana de impresión. Permití ventanas emergentes para este sitio.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();

  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState("guias");
  const [guides, setGuides] = useState(initialGuides);
  const [internalDocs, setInternalDocs] = useState(initialInternal);
  const [selectedDoc, setSelectedDoc] = useState(initialInternal[0]);
  const [guideQuery, setGuideQuery] = useState("");
  const [internalQuery, setInternalQuery] = useState("");
  const [guideDraft, setGuideDraft] = useState({
    guia: "",
    fecha: today(),
    remitente: "Peletería Continental",
    destinatario: "",
    destino: "",
    telefono: "",
    descripcion: "",
    monto: "",
    estado: "Registrada",
    archivo: "",
  });
  const [docDraft, setDocDraft] = useState(defaultDocDraft("Envío"));

  const filteredGuides = useMemo(() => {
    const q = guideQuery.toLowerCase().trim();
    if (!q) return guides;
    return guides.filter((g) => Object.values(g).join(" ").toLowerCase().includes(q));
  }, [guideQuery, guides]);

  const filteredInternal = useMemo(() => {
    const q = internalQuery.toLowerCase().trim();
    if (!q) return internalDocs;
    return internalDocs.filter((d) => Object.values(d).join(" ").toLowerCase().includes(q));
  }, [internalQuery, internalDocs]);

  const totals = useMemo(() => {
    const guideTotal = guides.reduce((acc, item) => acc + Number(item.monto || 0), 0);
    const internalPending = internalDocs
      .filter((item) => item.estado === "Pendiente")
      .reduce((acc, item) => acc + Number(item.monto || 0), 0);

    return {
      guides: guides.length,
      internal: internalDocs.length,
      guideTotal,
      internalPending,
    };
  }, [guides, internalDocs]);

  function updateGuide(field, value) {
    setGuideDraft((prev) => ({ ...prev, [field]: value }));
  }

  function updateDoc(field, value) {
    setDocDraft((prev) => ({ ...prev, [field]: value }));
  }

  function switchTab(tabId) {
    setActiveTab(tabId);
    setInternalQuery("");

    if (tabId === "envios") {
      setDocDraft(defaultDocDraft("Envío"));
      const first = internalDocs.find((item) => item.tipo === "Envío");
      setSelectedDoc(first || null);
    }

    if (tabId === "recibos") {
      setDocDraft(defaultDocDraft("Recibo"));
      const first = internalDocs.find((item) => item.tipo === "Recibo");
      setSelectedDoc(first || null);
    }
  }

  function handlePdfUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setGuideDraft((prev) => ({
      ...prev,
      archivo: file.name,
      descripcion: prev.descripcion || "PDF de guía Guatex pendiente de lectura automática",
    }));
  }

  function saveGuide(e) {
    e.preventDefault();

    if (!guideDraft.guia || !guideDraft.destinatario || !guideDraft.destino) {
      alert("Completa mínimo: No. guía, destinatario y destino.");
      return;
    }

    const newGuide = {
      id: Date.now(),
      ...guideDraft,
      monto: Number(guideDraft.monto || 0),
    };

    setGuides((prev) => [newGuide, ...prev]);
    setGuideDraft({
      guia: "",
      fecha: today(),
      remitente: "Peletería Continental",
      destinatario: "",
      destino: "",
      telefono: "",
      descripcion: "",
      monto: "",
      estado: "Registrada",
      archivo: "",
    });
  }

  function saveInternalDoc(e, forcedType) {
    e.preventDefault();

    if (!docDraft.cliente) {
      alert("Completa mínimo el nombre del cliente/persona.");
      return;
    }

    const newDoc = {
      id: Date.now(),
      ...docDraft,
      tipo: forcedType,
      monto: Number(docDraft.monto || 0),
    };

    setInternalDocs((prev) => [newDoc, ...prev]);
    setSelectedDoc(newDoc);
    setDocDraft(defaultDocDraft(forcedType));
  }

  function deleteGuide(id) {
    setGuides((prev) => prev.filter((item) => item.id !== id));
  }

  function deleteInternal(id) {
    const updated = internalDocs.filter((item) => item.id !== id);
    setInternalDocs(updated);
    setSelectedDoc(updated[0] || null);
  }

  function copySummary() {
    const text = `Resumen Ounett\nGuías: ${totals.guides}\nTotal guías: ${money(totals.guideTotal)}\nDocs internos: ${totals.internal}\nPendiente interno: ${money(totals.internalPending)}`;
    navigator.clipboard.writeText(text);
    alert("Resumen copiado.");
  }

  return (
    <div className="app">
      <div className="bg-glow glow-one"></div>
      <div className="bg-glow glow-two"></div>
      <div className="bg-grid"></div>

      <main className="container">
        <motion.header initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="header">
          <div>
            <div className="badge"><Sparkles size={14} /> Ounett Control System</div>
            <h1>Control de guías, envíos y recibos</h1>
            <p>
              Sistema interno para subir PDFs de Guatex, registrar guías, crear envíos/recibos en media carta horizontal y sacar resúmenes.
            </p>
          </div>

          <div className="mode-card">
            <span>Estado</span>
            <strong><ShieldCheck size={19} /> Local</strong>
          </div>
        </motion.header>

        <section className="stats-grid">
          <StatCard icon={<FileText />} label="Guías PDF" value={totals.guides} />
          <StatCard icon={<Package />} label="Docs internos" value={totals.internal} />
          <StatCard icon={<CheckCircle2 />} label="Total guías" value={money(totals.guideTotal)} />
          <StatCard icon={<Clock3 />} label="Pendiente" value={money(totals.internalPending)} />
        </section>

        <nav className="tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button type="button" key={tab.id} onClick={() => switchTab(tab.id)} className={activeTab === tab.id ? "active" : ""}>
                <Icon size={18} /> {tab.label}
              </button>
            );
          })}
        </nav>

        {activeTab === "guias" && (
          <section className="layout">
            <div className="card form-card">
              <div className="card-title-row">
                <div>
                  <h2>Subir / registrar guía Guatex</h2>
                  <p>Por ahora se carga el PDF y se llenan los campos. Luego activamos lectura automática.</p>
                </div>
                <div className="icon-box"><Upload /></div>
              </div>

              <form onSubmit={saveGuide} className="form">
                <Field label="PDF de Guatex">
                  <input type="file" accept="application/pdf" onChange={handlePdfUpload} />
                </Field>

                {guideDraft.archivo && <div className="file-pill">PDF cargado: {guideDraft.archivo}</div>}

                <div className="two-cols">
                  <Field label="No. guía">
                    <input placeholder="Ej. KU765M00000" value={guideDraft.guia} onChange={(e) => updateGuide("guia", e.target.value)} />
                  </Field>
                  <Field label="Fecha">
                    <input type="date" value={guideDraft.fecha} onChange={(e) => updateGuide("fecha", e.target.value)} />
                  </Field>
                </div>

                <Field label="Remitente">
                  <input value={guideDraft.remitente} onChange={(e) => updateGuide("remitente", e.target.value)} />
                </Field>

                <Field label="Destinatario">
                  <input placeholder="Nombre del destinatario" value={guideDraft.destinatario} onChange={(e) => updateGuide("destinatario", e.target.value)} />
                </Field>

                <Field label="Teléfono destinatario">
                  <input placeholder="Ej. 2416-1549" value={guideDraft.telefono} onChange={(e) => updateGuide("telefono", e.target.value)} />
                </Field>

                <Field label="Destino / dirección">
                  <textarea placeholder="Dirección o destino de entrega" value={guideDraft.destino} onChange={(e) => updateGuide("destino", e.target.value)} />
                </Field>

                <Field label="Descripción">
                  <textarea placeholder="Descripción del paquete o notas" value={guideDraft.descripcion} onChange={(e) => updateGuide("descripcion", e.target.value)} />
                </Field>

                <div className="two-cols">
                  <Field label="Monto">
                    <input type="number" placeholder="25.00" value={guideDraft.monto} onChange={(e) => updateGuide("monto", e.target.value)} />
                  </Field>
                  <Field label="Estado">
                    <select value={guideDraft.estado} onChange={(e) => updateGuide("estado", e.target.value)}>
                      <option>Registrada</option>
                      <option>Pendiente</option>
                      <option>Entregada</option>
                      <option>Anulada</option>
                    </select>
                  </Field>
                </div>

                <button type="submit" className="primary-btn">Guardar guía</button>
              </form>
            </div>

            <GuideTable guides={filteredGuides} query={guideQuery} setQuery={setGuideQuery} deleteGuide={deleteGuide} />
          </section>
        )}

        {activeTab === "envios" && (
          <InternalDocsSection
            title="Crear envío interno"
            docDraft={docDraft}
            updateDoc={updateDoc}
            saveInternalDoc={saveInternalDoc}
            filteredInternal={filteredInternal.filter((d) => d.tipo === "Envío")}
            internalQuery={internalQuery}
            setInternalQuery={setInternalQuery}
            selectedDoc={selectedDoc}
            setSelectedDoc={setSelectedDoc}
            deleteInternal={deleteInternal}
            forcedType="Envío"
          />
        )}

        {activeTab === "recibos" && (
          <InternalDocsSection
            title="Crear recibo"
            docDraft={docDraft}
            updateDoc={updateDoc}
            saveInternalDoc={saveInternalDoc}
            filteredInternal={filteredInternal.filter((d) => d.tipo === "Recibo")}
            internalQuery={internalQuery}
            setInternalQuery={setInternalQuery}
            selectedDoc={selectedDoc}
            setSelectedDoc={setSelectedDoc}
            deleteInternal={deleteInternal}
            forcedType="Recibo"
          />
        )}

        {activeTab === "resumen" && (
          <section className="card summary-card">
            <div className="card-title-row">
              <div>
                <h2>Resumen general</h2>
                <p>Vista rápida para cierre del día o control semanal.</p>
              </div>
              <div className="actions">
                <button type="button" onClick={copySummary}><Copy size={16} /> Copiar</button>
                <button type="button" onClick={() => window.print()}><Printer size={16} /> Imprimir</button>
              </div>
            </div>

            <div className="summary-grid">
              <SummaryBox label="Guías registradas" value={totals.guides} />
              <SummaryBox label="Total cobrado en guías" value={money(totals.guideTotal)} />
              <SummaryBox label="Envíos / recibos internos" value={totals.internal} />
              <SummaryBox label="Pendiente de cobro" value={money(totals.internalPending)} />
            </div>

            <div className="report-note">
              <Download size={18} /> Próxima fase: exportar este resumen a Excel/PDF y filtrar por fecha.
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function GuideTable({ guides, query, setQuery, deleteGuide }) {
  return (
    <div className="card right-panel-single">
      <div className="list-header">
        <div>
          <h2>Guías guardadas</h2>
          <p>Control de PDFs y datos extraídos o ingresados.</p>
        </div>
        <div className="search-box">
          <Search size={18} />
          <input placeholder="Buscar guía..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="table">
        <div className="table-head guides-head">
          <span>Guía</span><span>Destinatario</span><span>Destino</span><span>Monto</span><span>Estado</span><span></span>
        </div>
        <div className="table-body">
          {guides.map((item) => (
            <div key={item.id} className="table-row guides-row">
              <div><strong>{item.guia}</strong><small>{item.fecha}</small></div>
              <span>{item.destinatario}</span>
              <span>{item.destino}</span>
              <span>{money(item.monto)}</span>
              <span className="status generated">{item.estado}</span>
              <Trash2 onClick={() => deleteGuide(item.id)} className="delete-icon" size={18} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InternalDocsSection({ title, docDraft, updateDoc, saveInternalDoc, filteredInternal, internalQuery, setInternalQuery, selectedDoc, setSelectedDoc, deleteInternal, forcedType }) {
  const validSelected = selectedDoc?.tipo === forcedType ? selectedDoc : null;

  return (
    <section className="layout">
      <div className="card form-card">
        <div className="card-title-row">
          <div>
            <h2>{title}</h2>
            <p>Formato pensado para media carta horizontal.</p>
          </div>
          <div className="icon-box"><Plus /></div>
        </div>

        <form onSubmit={(e) => saveInternalDoc(e, forcedType)} className="form">
          <div className="two-cols">
            <Field label="Tipo">
              <select value={forcedType} disabled>
                <option>{forcedType}</option>
              </select>
            </Field>
            <Field label="Fecha del documento">
              <input type="date" value={docDraft.fecha} onChange={(e) => updateDoc("fecha", e.target.value)} />
            </Field>
          </div>

          {forcedType === "Recibo" && (
            <>
              <Field label="Tipo de recibo">
                <select
                  value={docDraft.subtipo}
                  onChange={(e) => {
                    const subtipo = e.target.value;
                    updateDoc("subtipo", subtipo);
                    updateDoc("concepto", subtipo === "Préstamo" ? "Préstamo de efectivo" : subtipo);
                  }}
                >
                  <option>Préstamo</option>
                  <option>Pago semanal</option>
                  <option>Pago quincenal</option>
                  <option>Pago mensual</option>
                </select>
              </Field>

              {docDraft.subtipo !== "Préstamo" && (
                <>
                  <div className="two-cols">
                    <Field label="Desde">
                      <input type="date" value={docDraft.fechaInicio} onChange={(e) => updateDoc("fechaInicio", e.target.value)} />
                    </Field>
                    <Field label="Hasta">
                      <input type="date" value={docDraft.fechaFin} onChange={(e) => updateDoc("fechaFin", e.target.value)} />
                    </Field>
                  </div>

                  <label className="check-field">
                    <input type="checkbox" checked={docDraft.incluyeSeptimo} onChange={(e) => updateDoc("incluyeSeptimo", e.target.checked)} />
                    Incluir séptimo día
                  </label>
                </>
              )}
            </>
          )}

          <Field label="Empresa / origen">
            <input value={docDraft.empresa} onChange={(e) => updateDoc("empresa", e.target.value)} />
          </Field>

          <Field label={forcedType === "Recibo" ? "Persona que recibe" : "Cliente / empresa destino"}>
            <input placeholder="Nombre de cliente, persona o empresa" value={docDraft.cliente} onChange={(e) => updateDoc("cliente", e.target.value)} />
          </Field>

          <Field label="Recibido por / firma">
            <input placeholder="Nombre o firma de quien recibe" value={docDraft.recibidoPor} onChange={(e) => updateDoc("recibidoPor", e.target.value)} />
          </Field>

          {forcedType !== "Recibo" && (
            <Field label="Concepto">
              <input placeholder="Mercadería pendiente de cancelar" value={docDraft.concepto} onChange={(e) => updateDoc("concepto", e.target.value)} />
            </Field>
          )}

          <div className="two-cols">
            <Field label="No. factura">
              <input placeholder="Ej. 8297" value={docDraft.factura} onChange={(e) => updateDoc("factura", e.target.value)} />
            </Field>
            <Field label="Monto">
              <input type="number" placeholder="0.00" value={docDraft.monto} onChange={(e) => updateDoc("monto", e.target.value)} />
            </Field>
          </div>

          <Field label="Estado">
            <select value={docDraft.estado} onChange={(e) => updateDoc("estado", e.target.value)}>
              <option>Pendiente</option>
              <option>Pagado</option>
              <option>Entregado</option>
              <option>Anulado</option>
            </select>
          </Field>

          <Field label="Observaciones">
            <textarea placeholder="Notas adicionales" value={docDraft.observaciones} onChange={(e) => updateDoc("observaciones", e.target.value)} />
          </Field>

          <button type="submit" className="primary-btn">Guardar {forcedType.toLowerCase()}</button>
        </form>
      </div>

      <div className="right-panel">
        <div className="card">
          <div className="list-header">
            <div>
              <h2>{forcedType}s guardados</h2>
              <p>Selecciona uno para ver la vista de impresión.</p>
            </div>
            <div className="search-box">
              <Search size={18} />
              <input placeholder="Buscar..." value={internalQuery} onChange={(e) => setInternalQuery(e.target.value)} />
            </div>
          </div>

          <div className="doc-list">
            {filteredInternal.map((item) => (
              <button type="button" key={item.id} onClick={() => setSelectedDoc(item)} className={`doc-row ${selectedDoc?.id === item.id ? "active" : ""}`}>
                <div>
                  <strong>{item.cliente}</strong>
                  <small>{item.fecha} · {item.subtipo || item.concepto}</small>
                </div>
                <span>{money(item.monto)}</span>
                <Trash2 onClick={(e) => { e.stopPropagation(); deleteInternal(item.id); }} className="delete-icon" size={18} />
              </button>
            ))}
          </div>
        </div>

        <PrintableDocument doc={validSelected} />
      </div>
    </section>
  );
}

function PrintableDocument({ doc }) {
  const lines = getDocumentText(doc);

  return (
    <div className="card printable-card">
      <div className="receipt-header-top no-print">
        <div>
          <h2>Vista media carta horizontal</h2>
          <p>Este diseño se puede imprimir o guardar como PDF.</p>
        </div>
        <button type="button" className="print-btn" onClick={() => openPrintWindow(doc)} disabled={!doc}>
          <Printer size={16} /> Imprimir solo documento
        </button>
      </div>

      {doc ? (
        <div className="half-letter-print" id="print-area">
          <div className="print-watermark">Ounett</div>
          <div className="print-top">
            <div className="print-brand-row">
              <div className="print-logo">
                <img src="/logo-peleteria.png" alt="Logo Peletería Continental" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
              <div>
                <span className="print-brand">{doc.empresa || "Peletería Continental"}</span>
                <h2>{doc.tipo}{doc.subtipo ? ` · ${doc.subtipo}` : ""}</h2>
              </div>
            </div>
            <div className="print-date">
              <span>Fecha</span>
              <strong>{doc.fecha}</strong>
            </div>
          </div>

          <div className="print-body">
            {lines.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>

          <div className="print-footer">
            <div className="signature-line">
              <span>Recibido por</span>
              <strong>{doc.recibidoPor || "________________"}</strong>
            </div>
            <div className="signature-line">
              <span>Estado</span>
              <strong>{doc.estado}</strong>
            </div>
          </div>

          <div className="dev-credit">Developed by Ounett · Edwin Escobar</div>
        </div>
      ) : (
        <div className="empty receipt-empty">Selecciona o crea un documento para ver la impresión.</div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
    </label>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <div className="card stat-card">
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
      </div>
      <div className="icon-box">{icon}</div>
    </div>
  );
}

function SummaryBox({ label, value }) {
  return (
    <div className="summary-box">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
