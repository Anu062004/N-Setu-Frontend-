import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../lib/api";
import type { AssistedAuditEvent } from "../../lib/types";
import { StatusLabel } from "../../components/ui/StatusLabel";
import { formatTime, formatDate } from "../../lib/format";

export function AssistedAudit() {
  const [events, setEvents] = useState<AssistedAuditEvent[]>([]);

  useEffect(() => {
    api.getAssistedAudit("sess_0938").then(setEvents);
  }, []);

  return (
    <div className="assisted-audit">
      <div className="container-narrow">
        <p className="eyebrow">Assisted mode · audit log</p>
        <h1 className="h-section">Session audit log</h1>
        <p className="small mt-3" style={{ maxWidth: 580 }}>
          Every action in a delegated session is recorded against both principals — the operator
          and the citizen — under the recorded consent reference. The operator is never the
          citizen.
        </p>

        <div className="assisted-banner mt-5" role="status">
          <StatusLabel label="SESSION sess_0938" />
          <span className="small">Citizen #8842 · Consent c_0938 · 17:00–18:00</span>
        </div>

        <table className="table table--dense mt-6">
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Consent</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td className="small tabular">{formatDate(e.occurredAt)} · {formatTime(e.occurredAt)}</td>
                <td className="small">{e.actor}</td>
                <td className="small">{e.action}</td>
                <td className="small tabular">{e.consentRef}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="small mt-4" style={{ maxWidth: 580 }}>
          The audit log is append-only. Every write carries both principals into the record, so
          assisted action is always attributable and never confused with citizen self-service.
        </p>

        <div className="mt-6">
          <Link to="/assist" className="btn btn--outline">← Back to assisted mode</Link>
        </div>
      </div>
    </div>
  );
}