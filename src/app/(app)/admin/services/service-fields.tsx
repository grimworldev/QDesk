type Option = { id: string; name: string };

type Defaults = {
    name?: string;
    code?: string;
    description?: string | null;
};

export function ServiceFields({
    mode,
    branches = [],
    branchName,
    defaults = {},
}: {
    mode: "create" | "edit";
    branches?: Option[];
    branchName?: string;
    defaults?: Defaults;
}) {
    return (
        <>
            <div>
                <label className="label">Branch</label>
                {mode === "create" ? (
                    <select
                        name="branch_id"
                        required
                        defaultValue={branches.length === 1 ? branches[0].id : ""}
                        className="input"
                    >
                        <option value="" disabled>Select branch</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                ) : (
                    <>
                        <input value={branchName ?? ""} disabled readOnly className="input opacity-60" />
                        <p className="mt-1 text-xs text-muted">The branch can't be changed after creation.</p>
                    </>
                )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                    <label className="label">Service name</label>
                    <input name="name" required defaultValue={defaults.name ?? ""} placeholder="Cashier" className="input" />
                </div>
                <div>
                    <label className="label">Ticket code</label>
                    <input
                        name="code"
                        required
                        maxLength={3}
                        defaultValue={defaults.code ?? ""}
                        placeholder="C"
                        className="input uppercase"
                    />
                    <p className="mt-1 text-xs text-muted">Tickets look like C001.</p>
                </div>
            </div>

            <div>
                <label className="label">Description (optional)</label>
                <textarea
                    name="description"
                    rows={2}
                    defaultValue={defaults.description ?? ""}
                    placeholder="Payments and cash transactions"
                    className="input"
                />
            </div>
        </>
    );
}