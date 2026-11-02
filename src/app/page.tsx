import Link from 'next/link';
import { ConnectionStatus } from '@/components/connection-status';

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Navegação principal">
        <Link className="brand" href="/" aria-label="Financial Agent">
          <span className="brand-mark">F</span>
          <span>Financial Agent</span>
        </Link>
        <span className="environment-label">Ambiente inicial</span>
      </nav>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Clareza para suas decisões</p>
          <h1>Seu dinheiro, com mais contexto e menos ruído.</h1>
          <p className="hero-description">
            Uma base segura e objetiva para acompanhar sua vida financeira. O
            Financial Agent está sendo preparado para evoluir com você.
          </p>
          <ConnectionStatus />
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="visual-orbit orbit-large" />
          <div className="visual-orbit orbit-small" />
          <div className="visual-core">
            <span>FA</span>
            <small>foundation</small>
          </div>
        </div>
      </section>

      <section className="principles" aria-labelledby="principles-title">
        <div className="section-heading">
          <p className="eyebrow">Princípios da plataforma</p>
          <h2 id="principles-title">Construído para ser confiável desde o início.</h2>
        </div>
        <div className="principle-grid">
          <article>
            <span className="principle-number">01</span>
            <h3>Dados sob controle</h3>
            <p>As regras e os cálculos pertencem ao backend, com uma interface clara para você.</p>
          </article>
          <article>
            <span className="principle-number">02</span>
            <h3>Decisões determinísticas</h3>
            <p>Resultados consistentes, explicáveis e sem saldos ou informações inventadas.</p>
          </article>
          <article>
            <span className="principle-number">03</span>
            <h3>Evolução incremental</h3>
            <p>Cada nova capacidade será adicionada com escopo pequeno, testável e seguro.</p>
          </article>
        </div>
      </section>

      <footer className="footer">
        <span>Financial Agent</span>
        <span>Fundação da interface · 2026</span>
      </footer>
    </main>
  );
}
