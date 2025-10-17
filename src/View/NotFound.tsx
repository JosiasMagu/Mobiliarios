import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <div className="text-center">
        <div className="text-4xl font-extrabold">404</div>
        <p className="text-slate-600 mt-2">Página não encontrada</p>
        <Link to="/" className="inline-block mt-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-semibold">
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
