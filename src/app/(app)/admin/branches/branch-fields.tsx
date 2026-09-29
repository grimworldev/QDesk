import { TIMEZONES } from "@/lib/timezones";

type Defaults = {
    name?: string;
    code?: string;
    address?: string | null;
    timezone?: string;
    is_active?: boolean;
};

export function BranchFields({
    mode,
    defaults = {},
}: {
    mode: "create" | "edit";
    defaults?: Defaults;
}) {
    const tz = defaults.timezone ?? "Asia/Manila";
    // keep the saved value selectable even if it's missing from the runtime list
    const zones = TIMEZONES.includes(tz) ? TIMEZONES : [tz, ...TIMEZONES];

    return (
        <>
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                    <label className="label">Branch name</label>
                    <input name="name" required defaultValue={defaults.name ?? ""} placeholder="Main Branch" className="input" />
                </div>
                <div>
                    <label className="label">Code</label>
                    {mode === "create" ? (
                        <>
                            <input
                                name="code"
                                required
                                minLength={2}
                                maxLength={10}
                                placeholder="MAIN"
                                className="input uppercase"
                            />
                            <p className="mt-1 text-xs text-muted">Can't be changed later.</p>
                        </>
                    ) : (
                        <input value={defaults.code ?? ""} disabled readOnly className="input opacity-60" />
                    )}
                </div>
            </div>

            <div>
                <label className="label">Address (optional)</label>
                <input name="address" defaultValue={defaults.address ?? ""} className="input" />
            </div>

            <div className={mode === "edit" ? "grid gap-4 sm:grid-cols-2" : ""}>
                <div>
                    <label className="label">Timezone</label>
                    <select name="timezone" required defaultValue={tz} className="input">
                        {zones.map((z) => (
                            <option key={z} value={z}>{z}</option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-muted">
                        Ticket numbers restart each day at midnight in this timezone.
                    </p>
                </div>

                {mode === "edit" && (
                    <div>
                        <label className="label">Status</label>
                        <select name="is_active" defaultValue={defaults.is_active === false ? "false" : "true"} className="input">
                            <option value="true">Active</option>
                            <option value="false">Inactive</option>
                        </select>
                        <p className="mt-1 text-xs text-muted">
                            Inactive branches can't issue new tickets.
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}