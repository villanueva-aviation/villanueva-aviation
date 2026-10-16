import { useEffect, useState } from "react";

/**
 * Fondo de la portada: el video del King Air XB-VLA muy oscuro, como una cabina de noche.
 * Solo en pantallas grandes y sin "reducir movimiento" (pesa 2.8 MB); si no, queda la foto fija.
 */
export function FondoHero() {
  const [video, setVideo] = useState(false);

  useEffect(() => {
    const grande = window.matchMedia("(min-width: 1024px)");
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)");
    const decidir = () => setVideo(grande.matches && !quieto.matches);
    decidir();
    grande.addEventListener("change", decidir);
    quieto.addEventListener("change", decidir);
    return () => {
      grande.removeEventListener("change", decidir);
      quieto.removeEventListener("change", decidir);
    };
  }, []);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {video ? (
        <video className="h-full w-full object-cover opacity-35" autoPlay muted loop playsInline poster="/images/msfs-xbvla-farmland.jpg">
          <source src="/media/hero-xbvla-kingair.mp4" type="video/mp4" />
        </video>
      ) : (
        <img src="/images/msfs-xbvla-farmland-1280.jpg" alt="" className="h-full w-full object-cover opacity-25" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/85 to-navy-950/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/70 via-transparent to-navy-950" />
      <div className="absolute inset-0 bg-grid opacity-30" />
    </div>
  );
}
