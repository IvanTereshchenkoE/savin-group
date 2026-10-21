import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Clock,
  Ruler,
  ArrowRight,
  ExternalLink,
  ChevronDown,
} from 'lucide-react';
import type { City } from '@/domain/calculator/types';

interface SectionProps {
  city: City;
}

export function HeroSection({ city }: SectionProps) {
  const cityName = city === 'spb' ? 'Санкт-Петербурге' : 'Нижнем Новгороде';
  const regionName = city === 'spb' ? 'СПб и Ленинградской области' : 'Нижнем Новгороде и области';

  return (
    <section className="relative overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#194B46]/10 text-[#194B46] text-xs font-bold uppercase tracking-wider mb-6">
            <span className="w-2 h-2 rounded-full bg-[#194B46]" />
            Специализированная бригада в {cityName}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#1F2626] tracking-tight leading-[1.15]">
            Гипсокартонные конструкции, шпаклёвка и покраска в{' '}
            <span className="text-[#194B46]">{cityName}</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#646E6E] leading-relaxed max-w-2xl">
            Возведение перегородок, обшивка стен, устройство коробов и потолков из ГКЛ с финишной
            подготовкой под обои и покраску. Работаем строго по нормам СП 163.1325800 и ГОСТ Р
            72509-2026.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="#calculator"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-bold text-white bg-[#C86F50] hover:bg-[#B45E41] shadow-md transition-all"
            >
              Рассчитать смету онлайн
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>

            <Link
              href="#cases"
              className="inline-flex items-center justify-center px-6 py-3.5 rounded-xl text-base font-bold text-[#1F2626] bg-white hover:bg-[#E5E3DC] border border-[#E5E3DC] transition-all"
            >
              Примеры выполненных работ
            </Link>
          </div>

          {/* Verification Badges */}
          <div className="mt-12 pt-8 border-t border-[#E5E3DC] grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs text-[#646E6E]">
            <div className="flex items-center gap-2.5">
              <Ruler className="w-5 h-5 text-[#194B46] shrink-0" />
              <span>Точный лазерный контроль плоскости</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-[#194B46] shrink-0" />
              <span>Соблюдение СП и ГОСТ на монтаж</span>
            </div>
            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
              <Clock className="w-5 h-5 text-[#194B46] shrink-0" />
              <span>Работаем по {regionName}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ServicesSection({ city }: SectionProps) {
  const isSpb = city === 'spb';

  const services = [
    {
      title: 'Перегородки из ГКЛ в 1–2 слоя',
      desc: 'Зонирование квартир, офисов и домов. Монтаж каркаса с виброразвязкой, усиление проемов под двери.',
      price: isSpb ? 'от 990 ₽/м²' : 'от 660 ₽/м²',
      tag: 'Конструкции ГКЛ',
    },
    {
      title: 'Шумоизоляционные перегородки',
      desc: '2 слоя гипсокартона с двух сторон, минеральная акустическая вата плотностью от 40 кг/м³ и демпферная лента.',
      price: isSpb ? 'от 1 980 ₽/м²' : 'от 1 210 ₽/м²',
      tag: 'Звукоизоляция',
    },
    {
      title: 'Обшивка и выравнивание стен ГКЛ',
      desc: 'Монтаж на металлокаркас с идеальной геометрией без мокрых штукатурных процессов.',
      price: isSpb ? 'от 660 ₽/м²' : 'от 440 ₽/м²',
      tag: 'Стены',
    },
    {
      title: 'Одноуровневые и двухуровневые потолки',
      desc: 'Подвесные потолочные системы на профилях Knauf с защитой от трещин по стыкам листов.',
      price: isSpb ? 'от 990 ₽/м²' : 'от 660 ₽/м²',
      tag: 'Потолки',
    },
    {
      title: 'Короба и ниши под скрытую подсветку',
      desc: 'Скрытие вентиляции, стояков отопления, организация парящих потолков и ниш для штор.',
      price: isSpb ? 'от 1 100 ₽/пог. м' : 'от 770 ₽/пог. м',
      tag: 'Декор и свет',
    },
    {
      title: 'Шпаклёвка под обои и покраску',
      desc: 'Базовое и финишное шпаклевание полимерными составами с армированием стыков бумажной лентой.',
      price: isSpb ? 'от 220 ₽/м²' : 'от 231 ₽/м²',
      tag: 'Малярные работы',
    },
    {
      title: 'Безвоздушная покраска стен и потолков',
      desc: 'Равномерное нанесение премиальных красок аппаратами высокого давления в 2 слоя без полос и переходов.',
      price: isSpb ? 'от 242 ₽/м²' : 'от 198 ₽/м²',
      tag: 'Покраска',
    },
  ];

  return (
    <section id="services" className="py-20 bg-[#F6F5F1] border-t border-[#E5E3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <h2 className="text-2xl sm:text-4xl font-black text-[#1F2626] tracking-tight">
            Специализация: гипсокартонные и малярные работы
          </h2>
          <p className="mt-3 text-[#646E6E] text-sm sm:text-base">
            Мы не берем «все работы подряд» и исключили штукатурку. Фокусируемся только на сухом
            монтаже ГКЛ и качественной чистовой малярке.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl p-6 border border-[#E5E3DC] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-[#194B46] bg-[#194B46]/10 px-2.5 py-1 rounded-md mb-3">
                  {item.tag}
                </span>
                <h3 className="text-lg font-bold text-[#1F2626] mb-2">{item.title}</h3>
                <p className="text-xs text-[#646E6E] leading-relaxed mb-4">{item.desc}</p>
              </div>

              <div className="pt-4 border-t border-[#E5E3DC] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#808C8C] block">Стоимость работ</span>
                  <span className="text-base font-extrabold text-[#194B46]">{item.price}</span>
                </div>
                <Link
                  href="#calculator"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#C86F50] bg-[#C86F50]/10 hover:bg-[#C86F50] hover:text-white transition-all"
                >
                  В расчёт
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function WorkflowSection() {
  const steps = [
    {
      num: '01',
      title: 'Заявка или расчет',
      desc: 'Оставляете телефон в калькуляторе или заказываете обратный звонок.',
    },
    {
      num: '02',
      title: 'Выезд и лазерный замер',
      desc: 'Специалист выезжает на объект, проверяет геометрию стен, высоты и перепады.',
    },
    {
      num: '03',
      title: 'Детальная смета',
      desc: 'Формируем точный расчет стоимости работ с фиксированной ценой.',
    },
    {
      num: '04',
      title: 'Монтаж каркаса ГКЛ',
      desc: 'Выставляем направляющие по лазеру, монтируем демпферные ленты и листы.',
    },
    {
      num: '05',
      title: 'Малярные работы',
      desc: 'Армирование швов, шпаклевание и безвоздушное окрашивание под проявочный свет.',
    },
    {
      num: '06',
      title: 'Сдача объекта',
      desc: 'Проверка плоскости правилом, подписание акта приемки выполненных работ.',
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-[#E5E3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F2626]">
            Порядок работы от замера до сдачи
          </h2>
          <p className="text-sm text-[#646E6E] mt-2">
            Прозрачный процесс без скрытых доплат и непредвиденных изменений сметы
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((st) => (
            <div
              key={st.num}
              className="p-6 rounded-2xl bg-[#F6F5F1] border border-[#E5E3DC] relative"
            >
              <span className="text-3xl font-black text-[#194B46]/20 block mb-2">{st.num}</span>
              <h3 className="text-base font-bold text-[#1F2626] mb-1.5">{st.title}</h3>
              <p className="text-xs text-[#646E6E] leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function NormsSection() {
  const norms = [
    {
      code: 'ГОСТ Р 72509-2026',
      title: 'Отделочные работы. Требования к результатам работ',
      status: 'Действует (введен с 01.03.2026)',
      url: 'https://protect.gost.ru/gost/details/109b9125-af8b-4383-9382-847eedd1afd4',
      relevance: 'Стандарты отклонений по плоскости и проверка качества финишной отделки.',
    },
    {
      code: 'СП 163.1325800.2014',
      title: 'Конструкции с применением гипсокартонных и гипсоволокнистых листов',
      status: 'Действующий строительный свод правил',
      url: 'https://protect.gost.ru/',
      relevance:
        'Правила монтажа профилей, шаг подвесов, крепление листов саморезами и деформационные швы.',
    },
    {
      code: 'ГОСТ 6266-97',
      title: 'Листы гипсокартонные. Технические условия',
      status: 'Действует',
      url: 'https://protect.gost.ru/gost/details/b82ec807-cf21-4116-87ff-2a9687c33979',
      relevance: 'Геометрические размеры, плотность и влагостойкость применяемых листов ГКЛ/ГКЛВ.',
    },
    {
      code: 'СП 71.13330.2017 (Изм. №3, №4)',
      title: 'Изоляционные и отделочные покрытия',
      status: 'Действует с изменениями',
      url: 'https://protect.gost.ru/sp/changesdetails/631b217d-c3b9-4776-a87e-075f6e5c00c6',
      relevance:
        'Нормативы сцепления слоев шпаклевки и допустимые просветы под 2-метровым контрольным правилом.',
    },
  ];

  return (
    <section className="py-20 bg-[#F6F5F1] border-t border-[#E5E3DC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#194B46] block mb-2">
            Инженерная точность
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#1F2626]">
            Применяемые нормативные документы (СП и ГОСТ)
          </h2>
          <p className="mt-2 text-sm text-[#646E6E]">
            Мы не даем пустых обещаний «евроремонта». Каждая перегородка и слой шпаклевки
            монтируются по действующим российским строительным нормативам.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {norms.map((norm, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-[#E5E3DC] shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-[#194B46] bg-[#194B46]/10 px-2.5 py-1 rounded">
                    {norm.code}
                  </span>
                  <span className="text-[11px] text-[#808C8C]">{norm.status}</span>
                </div>
                <h3 className="font-bold text-sm text-[#1F2626] mb-2">{norm.title}</h3>
                <p className="text-xs text-[#646E6E] leading-relaxed">{norm.relevance}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#E5E3DC]">
                <a
                  href={norm.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C86F50] hover:underline"
                >
                  Карточка норматива в Росстандарте
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FAQSection() {
  const faqs = [
    {
      q: 'Включены ли материалы в онлайн-расчет калькулятора?',
      a: 'Калькулятор рассчитывает стоимость выполнения работ. Материалы, крепеж, профили и доставка рассчитываются индивидуально после замера, так как на разных объектах требуются разные типы листов (стандартный ГКЛ, влагостойкий ГКЛВ, акустический Knauf Сапфир).',
    },
    {
      q: 'Выполняете ли вы штукатурные работы?',
      a: 'Нет. Мы принципиально специализируемся только на сухом строительстве из ГКЛ и чистовой малярке (шпаклевка, безвоздушная покраска). Это позволяет делать монтаж быстрее, чище и гарантировать отсутствие усадочных трещин.',
    },
    {
      q: 'Как влияет высота потолка на стоимость?',
      a: 'При высоте потолков до 3.0 метров действует базовая ставка. При высоте от 3.0 до 3.5 метров требуется монтаж со строительных подмостей/лесов (+15–20%). При высоте свыше 3.5 метров надбавка составляет 30%. Коэффициент высоты применяется только к монтажу потолков и высоких перегородок.',
    },
    {
      q: 'Чем отличается подготовка под обои от подготовки под покраску?',
      a: 'Под обои достаточно базового слоя шпаклевки (категория Q2). Под покраску требуется идеальное выравнивание финишной полимерной шпаклевкой в несколько слоев с армированием швов и контролем проявочным косым светом (категория Q3–Q4).',
    },
    {
      q: 'Сколько стоит выезд на замер объекта?',
      a: 'Выезд мастера и замер в черте города бесплатны при последующем заключении договора на выполнение работ. Точные условия замера за пределами КАД/города согласовываются индивидуально.',
    },
  ];

  return (
    <section className="py-20 bg-white border-t border-[#E5E3DC]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl sm:text-3xl font-black text-[#1F2626] text-center mb-10">
          Часто задаваемые вопросы
        </h2>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group p-5 rounded-2xl bg-[#F6F5F1] border border-[#E5E3DC] transition-all [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex items-center justify-between cursor-pointer font-bold text-sm sm:text-base text-[#1F2626]">
                <span>{faq.q}</span>
                <ChevronDown className="w-5 h-5 text-[#646E6E] group-open:rotate-180 transition-transform shrink-0 ml-4" />
              </summary>
              <p className="mt-3 text-xs sm:text-sm text-[#646E6E] leading-relaxed border-t border-[#E5E3DC]/60 pt-3">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
