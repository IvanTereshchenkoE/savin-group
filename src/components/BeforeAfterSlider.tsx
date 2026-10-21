'use client';

import React, { useState, useRef, useCallback } from 'react';
import { ChevronsLeftRight } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  description?: string;
}

export function BeforeAfterSlider({
  beforeLabel = 'Стандартный рассеянный свет',
  afterLabel = 'Проявочный косой свет (Q4 контроль)',
  title = 'Контроль геометрии и качества финишной поверхности',
  description = 'Сравните, как выглядит подготовленная поверхность под обычным освещением и под жестким контрольным светом проявочной лампы.',
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.min(Math.max((x / rect.width) * 100, 0), 100);
    setSliderPosition(percentage);
  }, []);

  const handlePointerDown = () => {
    setIsDragging(true);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      setSliderPosition((prev) => Math.max(prev - 5, 0));
    } else if (e.key === 'ArrowRight') {
      setSliderPosition((prev) => Math.min(prev + 5, 100));
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-8">
      {title && (
        <div className="text-center mb-6">
          <h3 className="text-xl sm:text-2xl font-bold text-[#1F2626] mb-2">{title}</h3>
          {description && <p className="text-sm text-[#646E6E] max-w-2xl mx-auto">{description}</p>}
        </div>
      )}

      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerMove={handlePointerMove}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="slider"
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Интерактивное сравнение освещения и плоскости"
        className="relative w-full aspect-16/10 rounded-2xl overflow-hidden select-none cursor-ew-resize border border-[#E5E3DC] shadow-md touch-none focus:outline-hidden focus:ring-2 focus:ring-[#194B46]"
      >
        {/* Layer 2: After State (Underneath, full width) */}
        <div className="absolute inset-0 bg-[#253232] flex items-center justify-center p-8 text-white">
          <div className="text-center max-w-md">
            <div className="inline-block px-3 py-1 bg-[#C86F50]/20 text-[#C86F50] border border-[#C86F50]/40 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Косой свет ламп Lossew / Q4
            </div>
            <h4 className="text-xl font-bold mb-2">Безупречная плоскость без теней</h4>
            <p className="text-xs text-[#A0ACAC] leading-relaxed">
              При боковом освещении проявляются малейшие дефекты. Мы выравниваем стыки ГКЛ и
              шпаклюем под покраску так, чтобы плоскость оставалась монолитной при любом источнике
              света.
            </p>
          </div>
          <span className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs px-3 py-1.5 rounded-md font-semibold">
            {afterLabel}
          </span>
        </div>

        {/* Layer 1: Before State (Clipped by sliderPosition) */}
        <div
          className="absolute inset-0 bg-[#E8E6DF] flex items-center justify-center p-8 text-[#1F2626] overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <div className="text-center max-w-md">
            <div className="inline-block px-3 py-1 bg-[#194B46]/10 text-[#194B46] border border-[#194B46]/30 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              Обычный свет
            </div>
            <h4 className="text-xl font-bold mb-2">Рассеянное дневное освещение</h4>
            <p className="text-xs text-[#646E6E] leading-relaxed">
              При фронтальном освещении стена кажется ровной, но после включения направленных бра
              или карнизной подсветки становятся видны все перепады и неровности, если работа
              выполнена без точного контроля.
            </p>
          </div>
          <span className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-xs text-[#1F2626] text-xs px-3 py-1.5 rounded-md font-semibold border border-[#E5E3DC]">
            {beforeLabel}
          </span>
        </div>

        {/* Divider Bar & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-[#194B46] shadow-xl border border-[#E5E3DC] flex items-center justify-center transition-transform hover:scale-110">
            <ChevronsLeftRight className="w-5 h-5 text-[#194B46]" />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#646E6E] mt-3 px-2">
        <span>← Рассеянный свет</span>
        <span className="text-[11px] bg-[#E5E3DC] px-2 py-0.5 rounded text-[#1F2626]">
          Потяните или используйте стрелки на клавиатуре
        </span>
        <span>Косой свет (Q4) →</span>
      </div>
    </div>
  );
}
