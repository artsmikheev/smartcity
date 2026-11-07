export const DEMO_NOTICE = "Демонстрационный экран — цифры и условия уточняет команда проекта.";

export type LayoutItem = {
  id: string;
  rooms: string;
  title: string;
  area: string;
  floor: string;
  feature: string;
  status: "На проверке" | "Запросить условия";
  tone: "lime" | "sand" | "amber";
};

export const layoutItems: LayoutItem[] = [
  {
    id: "layout-a",
    rooms: "1-комн.",
    title: "Компактный ритм",
    area: "Площадь — уточняется",
    floor: "Этаж — выбрать",
    feature: "Светлая логика планировки",
    status: "На проверке",
    tone: "lime",
  },
  {
    id: "layout-b",
    rooms: "2-комн.",
    title: "Для новых планов",
    area: "Площадь — уточняется",
    floor: "Этаж — выбрать",
    feature: "Сценарий для семьи",
    status: "Запросить условия",
    tone: "sand",
  },
  {
    id: "layout-c",
    rooms: "3-комн.",
    title: "Свободный масштаб",
    area: "Площадь — уточняется",
    floor: "Этаж — выбрать",
    feature: "Больше воздуха для идей",
    status: "На проверке",
    tone: "amber",
  },
];

export const constructionUpdates = [
  {
    id: "update-1",
    label: "Сейчас",
    title: "Контур проекта",
    copy: "Публикации о ходе строительства появятся после проверки материалов.",
    date: "Дата обновления уточняется",
    tone: "lime" as const,
  },
  {
    id: "update-2",
    label: "Следом",
    title: "Фото и видео",
    copy: "Лента будет собираться по корпусам, этапам и датам съёмки.",
    date: "Источник — команда проекта",
    tone: "sand" as const,
  },
  {
    id: "update-3",
    label: "Дальше",
    title: "Ваши уведомления",
    copy: "Авторизованные клиенты смогут получать новые статусы проекта.",
    date: "Push — следующий этап",
    tone: "amber" as const,
  },
];

export const faqs = [
  { question: "Как получить планировку?", answer: "Выберите вариант и оставьте заявку — команда проекта отправит подтверждённые материалы." },
  { question: "Что значит «забронировать»?", answer: "В приложении это заявка на связь и подбор. Это не юридическое бронирование и не гарантия наличия." },
  { question: "Где уточнить цену и условия?", answer: "Оставьте номер и удобный канал связи. Актуальные условия подтверждает менеджер." },
];

// Explicit dev-preview data copied from restore-archive/supabase/seed.sql.
// These are NOT live availability or prices. SVGs are schematic placeholders, not approved floor plans.
export const catalogDemoApartments: import('../types/catalog').CatalogApartment[] = [
  {
    id: 'demo-k1-204', building_id: 'demo-k1', layout_id: 'one-room-38', number: '204',
    floor: 2, rooms: 1, area: 38, price: 11900000, currency: 'RUB', availability_status: 'reserved',
    availability_updated_at: null, price_updated_at: null, is_demo: true, published: true,
    created_at: '2026-11-05T00:00:00Z', updated_at: '2026-11-05T00:00:00Z',
    plan_path: 'asset://plans/one-room-38.svg', media_kind: 'schematic', building_title: 'Корпус 1',
  },
  {
    id: 'demo-k2-603', building_id: 'demo-k2', layout_id: 'one-room-38', number: '603',
    floor: 6, rooms: 1, area: 38, price: 12400000, currency: 'RUB', availability_status: 'available',
    availability_updated_at: null, price_updated_at: null, is_demo: true, published: true,
    created_at: '2026-11-05T00:00:00Z', updated_at: '2026-11-05T00:00:00Z',
    plan_path: 'asset://plans/one-room-38.svg', media_kind: 'schematic', building_title: 'Корпус 2',
  },
  {
    id: 'demo-k1-305', building_id: 'demo-k1', layout_id: 'two-room-55', number: '305',
    floor: 3, rooms: 2, area: 55, price: 15800000, currency: 'RUB', availability_status: 'sold',
    availability_updated_at: null, price_updated_at: null, is_demo: true, published: true,
    created_at: '2026-11-05T00:00:00Z', updated_at: '2026-11-05T00:00:00Z',
    plan_path: 'asset://plans/two-room-55.svg', media_kind: 'schematic', building_title: 'Корпус 1',
  },
];
