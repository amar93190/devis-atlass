"use client";

type DeleteClientButtonProps = {
  companyName: string;
  email: string;
};

export function DeleteClientButton({ companyName, email }: DeleteClientButtonProps) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        const confirmed = window.confirm(
          `Supprimer définitivement le contact ${companyName} (${email}) ?`,
        );

        if (!confirmed) event.preventDefault();
      }}
      className="rounded-md border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50"
    >
      Supprimer
    </button>
  );
}
