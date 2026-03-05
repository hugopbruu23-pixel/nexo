import { motion } from "framer-motion";

export const ThinkingAnimation = () => {
  return (
    <div className="flex items-center gap-3 py-4 px-1">
      <div className="relative w-10 h-10">
        {/* Central core */}
        <motion.div
          className="absolute inset-0 m-auto w-3 h-3 rounded-full bg-foreground"
          animate={{
            scale: [0.8, 1.2, 0.8],
            opacity: [0.4, 1, 0.4],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute inset-0 m-auto w-2 h-2 rounded-full bg-foreground/60"
            style={{ originX: "50%", originY: "50%" }}
            animate={{
              rotate: 360,
              x: [0, Math.cos((i * 2 * Math.PI) / 3) * 14, 0],
              y: [0, Math.sin((i * 2 * Math.PI) / 3) * 14, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-foreground/20"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.5, 0.2],
            borderColor: [
              "hsl(0 0% 100% / 0.1)",
              "hsl(0 0% 100% / 0.4)",
              "hsl(0 0% 100% / 0.1)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      <div className="flex flex-col gap-1">
        <motion.span
          className="text-sm font-medium text-foreground/80"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Nexo está pensando...
        </motion.span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-foreground/40"
              animate={{
                scaleY: [1, 2.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
