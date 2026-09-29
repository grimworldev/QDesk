"use client";
import { useState } from "react";

type Branch = { id: string; name: string };
type Svc = { id: string; name: string; code: string; branch_id: string };
type Defaults = { name?: string; branch_id?: string; is_active?: boolean; service_ids?: string[] };

export function WindowFields({
    mode,
    branches,
    services,
    defaults = {},
}: {
    mode: "create" | "edit";
    branches: Branch[];
    services: Svc[];
    defaults?: Defaults;
}) {
    const [branchId, setBranchId] = useState(
        defaults.branch_id ?? (branches.length === 1 ? branches[0].id : "")
    );
    const list = services.filter((s) => s.branch_id === branchId);

    return (
        <>
            <div>
                <label className="label">Branch</label>
                {mode === "create" ? (
                    <select
                        name="branch_id"
                        required
                        value={branchId}
                        onChange={(e) => setBranchId(e.target.value)}
                        className="input"
                    >
                        <option value="" disabled>Select branch</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                ) : (
                    <>
                        <input
                            value={branches.find((b) => b.id === branchId)?.name ?? ""}
                            disabled
                            readOnly
                            className="input opacity-60"
                        />
                        <p className="mt-1 text-xs text-muted">The branch can't be changed after creation.</p>
                    </>
                )}
            </div>

            <div className={mode === "edit" ? "grid gap-4 sm:grid-cols-2" : ""}>
                <div>
                    <label className="label">Window name</label>
                    <input name="name" required defaultValue={defaults.name ?? ""} placeholder="Window 1" className="input" />
                </div>
                {mode === "edit" && (
                    <div>
                        <label className="label">Status</label>
                        <select name="is_active" defaultValue={defaults.is_active === false ? "false" : "true"} className="input">
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                    </div>
                )}
            </div>

            <fieldset>
                <legend className="label">Services this window handles</legend>
                {!branchId ? (
                    <p className="text-sm text-muted">Choose a branch first.</p>
                ) : list.length === 0 ? (
                    <p className="text-sm text-muted">This branch has no active services yet. Add services first.</p>
                ) : (
                    <div key={branchId} className="grid gap-2 sm:grid-cols-2">
                        {list.map((s) => (
                            <label key={s.id} className="card flex cursor-pointer items-center gap-3 p-3">
                                <input
                                    type="checkbox"
                                    name="service_ids"
                                    value={s.id}
                                    defaultChecked={defaults.service_ids?.includes(s.id)}
                                    className="size-5"
                                />
                                <span>
                                    <span className="mr-2 font-mono text-xs font-semibold text-accent-700">{s.code}</span>
                                    <span className="font-medium">{s.name}</span>
                                </span>
                            </label>
                        ))}
                    </div>
                )}
            </fieldset>
        </>
    );
}