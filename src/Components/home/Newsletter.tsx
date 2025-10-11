export function Newsletter({
  email,
  setEmail
}: {
  email: string;
  setEmail: (v: string) => void;
}) {
  return (
    <section id="newsletter" className="py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-2xl font-bold tracking-tight">Receba novidades e ofertas</h3>
        <p className="text-slate-600 mt-1">Cupões, lançamentos e dicas de design no seu e-mail.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) {
              alert("Obrigado! Em breve enviaremos novidades e ofertas.");
              setEmail("");
            }
          }}
          className="mt-6 flex flex-col sm:flex-row gap-3 justify-center"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="w-full sm:w-96 rounded-md border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button type="submit" className="rounded-md bg-slate-900 text-white px-6 py-3 hover:opacity-95">
            Inscrever
          </button>
        </form>
        <div className="text-xs text-slate-500 mt-2">
          Ao inscrever-se, concorda com nossa <a href="/privacidade" className="underline">Política de Privacidade</a>.
        </div>
      </div>
    </section>
  );
}
