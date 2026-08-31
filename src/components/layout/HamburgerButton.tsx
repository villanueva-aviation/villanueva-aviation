export function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  const ease = { transitionTimingFunction: "cubic-bezier(0.76,0,0.24,1)" };

  return (
    <button
      aria-label={open ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={open}
      onClick={onClick}
      className="relative z-[60] flex h-10 w-10 items-center justify-center xl:hidden"
    >
      <span
        className="absolute h-[2px] w-6 rounded-full bg-white transition-transform duration-500"
        style={{
          ...ease,
          transform: open ? "translateY(0) rotate(45deg)" : "translateY(-6px) rotate(0deg)",
        }}
      />
      <span
        className="absolute h-[2px] w-4 rounded-full bg-white transition-opacity duration-300"
        style={{ ...ease, opacity: open ? 0 : 1 }}
      />
      <span
        className="absolute h-[2px] w-6 rounded-full bg-white transition-transform duration-500"
        style={{
          ...ease,
          transform: open ? "translateY(0) rotate(-45deg)" : "translateY(6px) rotate(0deg)",
        }}
      />
    </button>
  );
}
