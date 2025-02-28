export default function CircularFade() {
  return (
    <div
      className="
        absolute
        lg:h-1/2
        md:h-1/4
        h-1/6
        backdrop-blur-xl
        md:backdrop-blur-2xl
        bg-gradient-to-b
        from-white/100
        to-white/0
        opacity-100
        z-10
        right-0
        w-[60vw]
        overflow-visible
        rounded-b-xl
      "
    />
  );
}