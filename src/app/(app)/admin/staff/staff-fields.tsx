type Option = { id: string; name: string };

type Defaults = {
    first_name?: string;
    middle_name?: string | null;
    last_name?: string;
    phone?: string | null;
    role_id?: string;
    branch_id?: string | null;
    status?: string;
};

export function StaffFields({
    mode, roles, branches, defaults = {}, email, lockAccess = false,
}: {
    mode: "create" | "edit";
    roles: Option[];
    branches: Option[];
    defaults?: Defaults;
    email?: string;
    lockAccess?: boolean;
}) {
    return (
        <>
            <div className="grid gap-4 sm:grid-cols-3">
                <div>
                    <label className="label">First name</label>
                    <input name="first_name" required defaultValue={defaults.first_name ?? ""} className="input" />
                </div>
                <div>
                    <label className="label">Middle name</label>
                    <input name="middle_name" defaultValue={defaults.middle_name ?? ""} className="input" />
                </div>
                <div>
                    <label className="label">Last name</label>
                    <input name="last_name" required defaultValue={defaults.last_name ?? ""} className="input" />
                </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <div>
                    <label className="label">Email</label>
                    {mode === "create" ? (
                        <input name="email" type="email" required className="input" />
                    ) : (
                        <input value={email ?? ""} disabled readOnly className="input opacity-60" />
                    )}
                </div>
                <div>
                    <label className="label">Phone</label>
                    <input name="phone" defaultValue={defaults.phone ?? ""} className="input" />
                </div>
            </div>

            {mode === "create" && (
                <div>
                    <label className="label">Temporary password</label>
                    <input name="password" type="password" required minLength={8} className="input" />
                    <p className="mt-1 text-xs text-muted">At least 8 characters. Share it with the staff member.</p>
                </div>
            )}

            <div className="grid gap-4 sm:grid-cols-3">
                <p className="mt-1 text-xs text-muted col-span-3">Role Required for Kiosk accounts.</p>
                <div>
                    <label className="label">Role</label>
                    <select name="role_id" required defaultValue={defaults.role_id ?? ""} disabled={lockAccess} className="input">
                        <option value="" disabled>Select role</option>
                        {roles.map((r) => (
                            <option key={r.id} value={r.id}>{r.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Branch</label>
                    <select name="branch_id" defaultValue={defaults.branch_id ?? ""} disabled={lockAccess} className="input">
                        <option value="">No branch</option>
                        {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="label">Status</label>
                    <select name="status" defaultValue={defaults.status ?? "active"} disabled={lockAccess} className="input">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {lockAccess && (
                <p className="text-xs text-muted">You can't change your own role, branch or status.</p>
            )}
        </>
    );
}