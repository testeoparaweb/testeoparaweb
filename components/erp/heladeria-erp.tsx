"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowDownCircle,
  ArrowUpCircle,
  BadgeDollarSign,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleHelp,
  Coffee,
  CreditCard,
  DollarSign,
  Flame,
  LayoutDashboard,
  Lightbulb,
  Minus,
  Package,
  Plus,
  ReceiptText,
  Search,
  ShoppingCart,
  Snowflake,
  Store,
  SunMedium,
  TimerReset,
  Trash2,
  Users,
  WalletCards,
} from "lucide-react";

import { LogoutButton } from "@/components/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewId =
  | "caja"
  | "analisis"
  | "historial"
  | "finanzas"
  | "empleados"
  | "stock";
type AttendanceEvent = "entrada" | "salida";
type ShiftName = "manana" | "tarde";
type HelpSection = {
  title: string;
  description: string;
  details: string[];
};

type DeleteConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => Promise<boolean>;
};

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  unit: string;
  imageUrl: string;
  maxFlavors: number;
  flavorUsage: number;
};

type ProductForm = Product;

type IceCreamFlavor = {
  id: string;
  name: string;
  category: string;
  available: boolean;
  color: string;
  stock: number;
  minStock: number;
  unit: string;
};

type FlavorForm = IceCreamFlavor;

type CartLine = {
  lineId: string;
  productId: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  quantity: number;
  unit: string;
  imageUrl: string;
  flavors: string[];
  flavorUsage: number;
};

type Sale = {
  id: string;
  customer: string;
  items: number;
  method: string;
  time: string;
  total: number;
  subtotal: number;
  discount: number;
  createdAt: string;
};

type SaleItem = {
  id: string;
  saleId: string;
  product: string;
  quantity: number;
  cost: number;
  flavors: string[];
  createdAt: string;
};

type Expense = {
  key: string;
  label: string;
  category: string;
  amount: number;
};

type ExpenseHistory = {
  id: string;
  startsAt: string;
  total: number;
  expenses: Expense[];
};

type FlavorBatch = {
  id: string;
  flavorId: string;
  flavorName: string;
  kilos: number;
  portionsLoaded: number;
  systemStockAtClose: number | null;
  suggestedYield: number | null;
  status: "activa" | "cerrada";
  createdAt: string;
  closedAt: string | null;
};

type StaffMember = {
  id?: string;
  name: string;
  role: string;
  shift: string;
  area: string;
  status: "Activo" | "Pausa" | "Ausente" | "Franco";
};

type StaffForm = StaffMember;

type Attendance = {
  id: string;
  staffId?: string | null;
  employeeName: string;
  eventType: AttendanceEvent;
  shift: ShiftName;
  recordedAt: string;
};

type NavItem = {
  id: ViewId;
  label: string;
  icon: LucideIcon;
};

type NumericValue = number | string | null;

type ProductRow = {
  id: string;
  nombre: string;
  categoria: string;
  precio: NumericValue;
  costo: NumericValue;
  stock: NumericValue;
  stock_minimo: NumericValue;
  unidad: string;
  imagen: string | null;
  max_gustos: number | null;
  consumo_gustos?: NumericValue;
};

type FlavorRow = {
  id: string;
  nombre: string;
  categoria?: string | null;
  disponible: boolean | null;
  color: string | null;
  stock?: NumericValue;
  stock_minimo?: NumericValue;
  unidad?: string | null;
};

type PaymentMethodRow = {
  nombre: string;
};

type SaleRow = {
  id: string;
  cliente: string | null;
  productos: number | null;
  metodo: string | null;
  hora: string | null;
  total: NumericValue;
  subtotal: NumericValue;
  descuento: NumericValue;
  creado: string | null;
};

type SaleItemRow = {
  id: string;
  venta_id: string;
  producto: string;
  cantidad: NumericValue;
  costo: NumericValue;
  gustos: string[] | null;
  creado: string | null;
};

type ExpenseRow = {
  clave: string;
  nombre: string;
  categoria: string;
  monto: NumericValue;
};

type ExpenseHistoryRow = {
  id: string;
  fecha_desde: string;
  total: NumericValue;
  gastos: Array<{
    clave?: string;
    nombre?: string;
    categoria?: string;
    monto?: NumericValue;
  }> | null;
};

type FlavorBatchRow = {
  id: string;
  gusto_id: string;
  gusto: string;
  kilos: NumericValue;
  porciones_cargadas: NumericValue;
  stock_sistema_al_cerrar: NumericValue;
  rendimiento_sugerido: NumericValue;
  estado: "activa" | "cerrada";
  creado: string;
  cerrado: string | null;
};

type StaffRow = {
  id: string;
  nombre: string;
  rol: string;
  turno: string;
  sector: string;
  estado: string;
};

type AttendanceRow = {
  id: string;
  empleado_id: string | null;
  empleado: string;
  tipo: string;
  turno: string;
  creado: string;
};

type ErpDataResponse = {
  productos: ProductRow[];
  gustos: FlavorRow[];
  metodos_pago: PaymentMethodRow[];
  ventas: SaleRow[];
  items_venta: SaleItemRow[];
  gastos: ExpenseRow[];
  gastos_historial: ExpenseHistoryRow[];
  tandas_gustos: FlavorBatchRow[];
  empleados: StaffRow[];
  asistencias: AttendanceRow[];
};

const DEFAULT_BRANCH_ID = "00000000-0000-0000-0000-000000000001";

const navItems: NavItem[] = [
  { id: "caja", label: "Caja", icon: ShoppingCart },
  { id: "analisis", label: "AnÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡lisis", icon: BarChart3 },
  { id: "historial", label: "Historial", icon: CalendarClock },
  { id: "finanzas", label: "Ganancia", icon: WalletCards },
  { id: "empleados", label: "Empleados", icon: Users },
  { id: "stock", label: "Stock", icon: Package },
];

const helpContentByView: Record<
  ViewId,
  { title: string; summary: string; sections: HelpSection[] }
> = {
  caja: {
    title: "Ayuda de caja",
    summary: "Para tomar pedidos rapido y cobrar sin perder ventas ni stock.",
    sections: [
      {
        title: "Categorias",
        description:
          "Primero elegi una categoria y despues un producto. Asi el empleado encuentra todo mas rapido.",
        details: [
          "Cuando entras a Caja, primero ves las categorias grandes. Eso sirve para no mezclar todo el catalogo junto.",
          "Si tocas una categoria, entrás a esa vista y ahi aparecen solo los productos de ese rubro. Con Volver regresas al inicio.",
          "Si no sabes donde esta algo, usa el buscador de esa categoria para filtrar por nombre.",
        ],
      },
      {
        title: "Helados y gustos",
        description:
          "Si el producto necesita gustos, se abre una ventana para elegir sabores. Podes buscar sabores, repetirlos y ver el stock estimado.",
        details: [
          "Los productos de helado abren una ventana especial para elegir gustos segun el maximo permitido por ese producto.",
          "El buscador de sabores filtra por nombre o por categoria del gusto, por ejemplo crema o al agua.",
          "Si el cliente repite un sabor, podes tocar el mismo gusto mas de una vez y el sistema lo cuenta en el pedido.",
        ],
      },
      {
        title: "Pedido",
        description:
          "A la derecha se arma el pedido. Desde ahi podes sumar, restar, borrar lineas, elegir metodo de pago y cobrar.",
        details: [
          "Cada vez que agregas un producto, aparece en el panel del pedido con cantidad, total y gustos si corresponde.",
          "Los botones de sumar, restar o borrar sirven para corregir el pedido antes de cobrarlo.",
          "Cuando tocas Cobrar pedido, se guarda la venta, descuenta stock y despues aparece en analisis e historial.",
        ],
      },
      {
        title: "Bajo stock",
        description:
          "El boton de bajo stock muestra rapido los productos o gustos que estan en o por debajo del minimo.",
        details: [
          "Si tocas Bajo stock, entras en una vista especial para revisar faltantes sin recorrer toda la caja.",
          "Ahi podes cambiar entre Productos y Gustos para ver que hay que reponer.",
          "Esta vista es solo informativa para trabajar mas rapido; la reposicion real se hace desde Stock.",
        ],
      },
    ],
  },
  analisis: {
    title: "Ayuda de analisis",
    summary: "Para ver ventas, costo vendido, ganancias y detalle del mes.",
    sections: [
      {
        title: "Resumen",
        description:
          "Muestra ventas brutas, costo de productos vendidos, gastos fijos, productos vendidos y ganancia real.",
        details: [
          "Ventas brutas muestra todo lo cobrado en el periodo sin restar nada.",
          "Costo de productos vendidos usa el costo cargado en cada producto y lo descuenta solo si ese producto se vendio.",
          "Ganancia real es el numero final despues de restar costo vendido y gastos fijos.",
        ],
      },
      {
        title: "Rankings",
        description:
          "Ahi ves los gustos y productos mas pedidos segun las ventas guardadas.",
        details: [
          "El ranking de gustos sale de los gustos elegidos en las ventas, no de una carga manual.",
          "El ranking de productos suma cantidades vendidas del mes para mostrar que rota mas.",
          "Sirve para detectar que conviene producir mas o que producto conviene destacar.",
        ],
      },
      {
        title: "Ventas",
        description:
          "Cada fila es una venta. Si la tocas, se despliega el detalle completo con productos, gustos, cliente, metodo y total.",
        details: [
          "La fila muestra un resumen corto del pedido para que no tengas que leer codigos internos.",
          "Cuando la expandis, ves fecha y hora exacta, subtotal, descuento, total y cada producto del pedido.",
          "Sirve para revisar errores, confirmar que se cobro algo o entender que se vendio en una venta puntual.",
        ],
      },
      {
        title: "Gastos",
        description:
          "Resume lo que se resta para calcular la ganancia real del negocio.",
        details: [
          "Ahi podes comparar rapido el costo vendido contra los gastos fijos del local.",
          "No mezcla compras genericas con ventas; la idea es que la ganancia refleje lo que realmente se vendio.",
          "Si algo no te cierra en la ganancia, esta vista es el primer lugar para revisarlo.",
        ],
      },
    ],
  },
  historial: {
    title: "Ayuda de historial",
    summary: "Para comparar como viene el negocio por dia, semana, mes o año.",
    sections: [
      {
        title: "Periodos",
        description:
          "Usa los botones Diario, Semanal, Mensual y Anual para cambiar la vista del historial.",
        details: [
          "Cada boton cambia solo la tabla de ese periodo para que no tengas todo mezclado en la misma pantalla.",
          "Diario sirve para ver la ultima semana, Semanal resume bloques de 7 dias, Mensual compara meses y Anual compara años.",
          "Es ideal para detectar si hubo semanas flojas, meses fuertes o cambios en la estacionalidad.",
        ],
      },
      {
        title: "Neto",
        description:
          "El valor neto ya descuenta costo de productos vendidos y gastos fijos del periodo.",
        details: [
          "El neto no es solo ventas menos gastos fijos: tambien resta el costo de lo que realmente se vendio en ese periodo.",
          "Por eso puede pasar que un periodo venda mucho pero deje menos margen que otro.",
          "Te sirve para leer el negocio con mas precision, no solo por caja bruta.",
        ],
      },
      {
        title: "Productos",
        description:
          "La ultima columna muestra cuantas unidades se vendieron en cada periodo.",
        details: [
          "Ese numero te ayuda a entender si el ingreso vino por vender mucho o por vender tickets mas caros.",
          "Comparar productos vendidos con el total neto sirve para medir volumen contra margen.",
          "Tambien ayuda a detectar dias con mucho movimiento aunque el importe total no haya sido tan alto.",
        ],
      },
    ],
  },
  finanzas: {
    title: "Ayuda de ganancia",
    summary: "Para ver cuanto entra, cuanto cuesta vender y cuanto queda realmente.",
    sections: [
      {
        title: "Total vendido",
        description:
          "Es todo lo que entro por ventas antes de restar costos y gastos.",
        details: [
          "Este numero es bruto: muestra cuanto entro por caja, mostrador o los metodos de pago guardados.",
          "No significa ganancia; solo es el ingreso antes de cualquier descuento.",
          "Sirve como punto de partida para entender el resto del cuadro.",
        ],
      },
      {
        title: "Costo vendido",
        description:
          "Se calcula automatico con el costo cargado en cada producto y solo descuenta lo que realmente se vendio.",
        details: [
          "Si un producto no se vendio, su costo no impacta en esta parte del calculo.",
          "Esto evita mezclar compras generales con margen real de lo que salio por venta.",
          "Por eso es importante mantener bien cargado el costo de cada producto en Stock.",
        ],
      },
      {
        title: "Gastos fijos",
        description:
          "Aca editas sueldos, luz, agua, gas, alquiler y otros gastos generales del local.",
        details: [
          "Estos gastos se descuentan aparte del costo del producto vendido.",
          "Sirven para representar la carga fija del negocio: personal, servicios y alquiler.",
          "Cuando cambias uno y guardas, la ganancia se recalcula con ese valor hacia adelante.",
        ],
      },
      {
        title: "Ganancia real",
        description:
          "Es el resultado final: ventas menos costo vendido y menos gastos fijos.",
        details: [
          "Es el numero mas confiable para ver cuanto deja realmente el negocio en el periodo.",
          "No depende de cargar compras manuales de materiales para cada venta, sino del costo del producto que si se vendio.",
          "Si queres mejorar este numero, lo importante es mirar margen por producto y gastos fijos.",
        ],
      },
    ],
  },
  empleados: {
    title: "Ayuda de empleados",
    summary: "Para administrar el equipo y registrar entradas y salidas.",
    sections: [
      {
        title: "Alta y edicion",
        description:
          "Desde Agregar empleado cargas uno nuevo. En cada tarjeta tambien podes editar nombre, rol, turno, sector y estado.",
        details: [
          "Usa Agregar empleado para cargar nuevos miembros del equipo con sus datos basicos.",
          "En cada tarjeta el boton Editar te deja cambiar nombre, rol, turno, sector y estado sin borrar el empleado.",
          "Es util para mantener actualizado quien esta en caja, produccion, salon o cafeteria.",
        ],
      },
      {
        title: "Entrada y salida",
        description:
          "Los botones registran cuando cada empleado entra o sale y lo guardan en los registros.",
        details: [
          "Entrada guarda el momento en que empieza a trabajar y Salida marca cuando termina o se retira.",
          "Cada registro queda con fecha completa y turno para poder revisarlo despues.",
          "Esto ayuda a ordenar horarios y a controlar quien estuvo trabajando en cada franja.",
        ],
      },
      {
        title: "Registros",
        description:
          "A la derecha ves el historial reciente con fecha completa y tipo de movimiento.",
        details: [
          "La columna de registros muestra entradas y salidas recientes con una marca visual distinta para cada tipo.",
          "Sirve para confirmar rapido si alguien ya entro, salio o si se olvidaron de marcar.",
          "Tambien te deja revisar los movimientos del dia sin entrar a otra pantalla.",
        ],
      },
    ],
  },
  stock: {
    title: "Ayuda de stock",
    summary: "Para controlar productos, gustos y alertas de reposicion.",
    sections: [
      {
        title: "Productos",
        description:
          "Aca editas nombre, precio, costo, stock, minimo, unidad, imagen y configuracion de gustos.",
        details: [
          "Cada producto tiene su precio de venta, su costo y su stock disponible. Eso alimenta tanto caja como ganancia real.",
          "El minimo sirve para disparar alertas de reposicion y mostrar bajo stock en varias partes del sistema.",
          "Si es un helado, tambien podes definir cuantos gustos permite y cuanto descuenta del stock de sabores.",
        ],
      },
      {
        title: "Gustos",
        description:
          "Aca controlas stock de sabores, categoria, color, baldes y reposicion por gusto.",
        details: [
          "Los gustos tienen stock propio, minimo, categoria y color para que sea mas facil usarlos en caja.",
          "Tambien podes cargar tandas o baldes para calibrar cuantas porciones reales te rinde cada sabor.",
          "Esto ayuda a que el stock de sabores baje con las ventas de helado y no quede solo a ojo.",
        ],
      },
      {
        title: "Alertas",
        description:
          "Los filtros de bajo stock sirven para encontrar rapido que hay que reponer.",
        details: [
          "Podes filtrar solo productos bajos o solo gustos bajos segun que necesites revisar.",
          "Las alertas aparecen para acelerar la reposicion y evitar quedarte sin algo en caja.",
          "Lo ideal es revisar esta parte antes de los horarios fuertes del local.",
        ],
      },
      {
        title: "Costo del producto",
        description:
          "El costo que cargues en cada producto se usa despues para calcular la ganancia real cuando ese producto se vende.",
        details: [
          "Si el costo esta mal cargado, la ganancia real tambien va a quedar mal calculada.",
          "No hace falta cargar compras manuales para que impacten en cada venta: el sistema usa este costo por producto vendido.",
          "Por eso conviene revisar el costo cada vez que cambian fuerte los insumos o la receta.",
        ],
      },
    ],
  },
};
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);

const formatFullDateTime = (value: string) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date(value));

const getCurrentTime = () => {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  const second = String(now.getSeconds()).padStart(2, "0");
  return `${hour}:${minute}:${second}`;
};

const toNumber = (value: NumericValue) => Number(value ?? 0);

const createIdFromName = (name: string) =>
  name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

const createAutomaticId = (
  name: string,
  existingIds: string[],
  currentId?: string,
) => {
  if (currentId?.trim()) {
    return currentId.trim();
  }

  const baseId = createIdFromName(name) || `item-${Date.now()}`;
  const usedIds = new Set(existingIds.filter((id) => id !== currentId));

  if (!usedIds.has(baseId)) {
    return baseId;
  }

  let suffix = 2;
  let candidate = `${baseId}-${suffix}`;

  while (usedIds.has(candidate)) {
    suffix += 1;
    candidate = `${baseId}-${suffix}`;
  }

  return candidate;
};

const getFlavorCategoryName = (category?: string | null) =>
  category?.trim() || "Sin categoria";

const groupFlavorsByCategory = (flavors: IceCreamFlavor[]) => {
  const groups = flavors.reduce<Map<string, IceCreamFlavor[]>>((map, flavor) => {
    const category = getFlavorCategoryName(flavor.category);
    const current = map.get(category) ?? [];
    current.push(flavor);
    map.set(category, current);
    return map;
  }, new Map<string, IceCreamFlavor[]>());

  return Array.from(groups.entries())
    .sort(([left], [right]) => left.localeCompare(right, "es-AR"))
    .map(([category, items]) => ({
      category,
      items: items.sort((left, right) => left.name.localeCompare(right.name, "es-AR")),
    }));
};

const getSaleHour = (sale: Sale) => {
  const [hour] = sale.time.split(":");
  return Number(hour || 0);
};

const getCurrentShift = (): ShiftName =>
  new Date().getHours() < 14 ? "manana" : "tarde";

const isAttendanceEvent = (value: string): value is AttendanceEvent =>
  ["entrada", "salida"].includes(value);

const isShiftName = (value: string): value is ShiftName =>
  ["manana", "tarde"].includes(value);

const mapProduct = (product: ProductRow): Product => ({
  id: product.id,
  name: product.nombre,
  category: product.categoria,
  price: toNumber(product.precio),
  cost: toNumber(product.costo),
  stock: toNumber(product.stock),
  minStock: toNumber(product.stock_minimo),
  unit: product.unidad,
  imageUrl: product.imagen ?? "",
  maxFlavors: product.max_gustos ?? 0,
  flavorUsage: toNumber(product.consumo_gustos ?? 0),
});

const mapFlavor = (flavor: FlavorRow): IceCreamFlavor => ({
  id: flavor.id,
  name: flavor.nombre,
  category: getFlavorCategoryName(flavor.categoria),
  available: flavor.disponible ?? true,
  color: flavor.color ?? "#67e8f9",
  stock: toNumber(flavor.stock ?? 0),
  minStock: toNumber(flavor.stock_minimo ?? 0),
  unit: flavor.unidad ?? "porciones",
});

const mapSale = (sale: SaleRow): Sale => ({
  id: sale.id,
  customer: sale.cliente ?? "Mostrador",
  items: sale.productos ?? 0,
  method: sale.metodo ?? "Sin metodo",
  time: sale.hora?.slice(0, 5) ?? "--:--",
  total: toNumber(sale.total),
  subtotal: toNumber(sale.subtotal) || toNumber(sale.total),
  discount: toNumber(sale.descuento),
  createdAt: sale.creado ?? new Date().toISOString(),
});

const mapSaleItem = (item: SaleItemRow): SaleItem => ({
  id: item.id,
  saleId: item.venta_id,
  product: item.producto,
  quantity: toNumber(item.cantidad),
  cost: toNumber(item.costo),
  flavors: item.gustos ?? [],
  createdAt: item.creado ?? new Date().toISOString(),
});

const mapExpense = (expense: ExpenseRow): Expense => ({
  key: expense.clave,
  label: expense.nombre,
  category: expense.categoria,
  amount: toNumber(expense.monto),
});

const mapExpenseHistory = (history: ExpenseHistoryRow): ExpenseHistory => ({
  id: history.id,
  startsAt: history.fecha_desde,
  total: toNumber(history.total),
  expenses: (history.gastos ?? []).map((expense) => ({
    key: expense.clave ?? "gasto",
    label: expense.nombre ?? "Gasto",
    category: expense.categoria ?? "General",
    amount: toNumber(expense.monto ?? 0),
  })),
});

const mapFlavorBatch = (batch: FlavorBatchRow): FlavorBatch => ({
  id: batch.id,
  flavorId: batch.gusto_id,
  flavorName: batch.gusto,
  kilos: toNumber(batch.kilos),
  portionsLoaded: toNumber(batch.porciones_cargadas),
  systemStockAtClose:
    batch.stock_sistema_al_cerrar === null
      ? null
      : toNumber(batch.stock_sistema_al_cerrar),
  suggestedYield:
    batch.rendimiento_sugerido === null
      ? null
      : toNumber(batch.rendimiento_sugerido),
  status: batch.estado,
  createdAt: batch.creado,
  closedAt: batch.cerrado,
});

const mapStaffMember = (person: StaffRow): StaffMember => ({
  id: person.id,
  name: person.nombre,
  role: person.rol,
  shift: person.turno,
  area: person.sector,
  status:
    person.estado === "Activo" ||
    person.estado === "Pausa" ||
    person.estado === "Ausente" ||
    person.estado === "Franco"
      ? person.estado
      : "Activo",
});

const mapAttendance = (attendance: AttendanceRow): Attendance => ({
  id: attendance.id,
  staffId: attendance.empleado_id,
  employeeName: attendance.empleado,
  eventType: isAttendanceEvent(attendance.tipo)
    ? attendance.tipo
    : "entrada",
  shift: isShiftName(attendance.turno) ? attendance.turno : "manana",
  recordedAt: attendance.creado,
});

export function HeladeriaErp() {
  const [activeView, setActiveView] = useState<ViewId>("caja");
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] =
    useState<DeleteConfirmation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [iceCreamFlavors, setIceCreamFlavors] = useState<IceCreamFlavor[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<string[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseHistory, setExpenseHistory] = useState<ExpenseHistory[]>([]);
  const [flavorBatches, setFlavorBatches] = useState<FlavorBatch[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [customer, setCustomer] = useState("Mostrador");
  const [notice, setNotice] = useState("Conectando con la base de datos");
  const [sessionEmail] = useState<string | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const [, setIsSupabaseReady] = useState(false);
  const [, setIsLoadingData] = useState(true);
  const activeHelp = helpContentByView[activeView];

  const loadData = async (successNotice = "Datos conectados con Supabase") => {
    setIsLoadingData(true);

    const response = await fetch("/api/erp/datos", { cache: "no-store" }).catch(
      () => null,
    );

    if (!response?.ok) {
      setIsSupabaseReady(false);
      setIsLoadingData(false);
      setNotice("No se pudo cargar la base de datos");
      return false;
    }

    const data = (await response.json()) as ErpDataResponse;
    const methods = (data.metodos_pago ?? []).map((item) => item.nombre);

    setProducts((data.productos ?? []).map(mapProduct));
    setIceCreamFlavors((data.gustos ?? []).map(mapFlavor));
    setPaymentMethods(methods);
    setSales((data.ventas ?? []).map(mapSale));
    setSaleItems((data.items_venta ?? []).map(mapSaleItem));
    setExpenses((data.gastos ?? []).map(mapExpense));
    setExpenseHistory((data.gastos_historial ?? []).map(mapExpenseHistory));
    setFlavorBatches((data.tandas_gustos ?? []).map(mapFlavorBatch));
    setStaff((data.empleados ?? []).map(mapStaffMember));
    setAttendance((data.asistencias ?? []).map(mapAttendance));
    setPaymentMethod((current) =>
      current && methods.includes(current) ? current : methods[0] ?? "",
    );
    setIsSupabaseReady(true);
    setIsLoadingData(false);
    setNotice(successNotice);
    return true;
  };

  useEffect(() => {
    loadData();
  }, []);

  const cartItems = cart;
  const categories = ["Todos", ...new Set(products.map((product) => product.category))];

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesCategory =
        category === "Todos" || product.category === category;
      const matchesQuery = product.name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, products, query]);

  const saleSubtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const saleDiscount = saleSubtotal >= 30000 ? saleSubtotal * 0.05 : 0;
  const saleTotal = saleSubtotal - saleDiscount;
  const grossRevenue = sales.reduce((total, sale) => total + sale.total, 0);
  const soldProductCost = saleItems.reduce(
    (total, item) => total + item.cost * item.quantity,
    0,
  );
  const financialTimestamps = [
    ...sales.map((sale) => new Date(sale.createdAt).getTime()),
    ...expenseHistory.map((snapshot) => new Date(snapshot.startsAt).getTime()),
  ].filter((value) => Number.isFinite(value));
  const financialRangeEnd = financialTimestamps.length
    ? endOfDay(new Date(Math.max(...financialTimestamps)))
    : endOfDay(new Date("2026-01-01T00:00:00.000Z"));
  const financialRangeStart = sales.length
    ? startOfDay(
        new Date(
          Math.min(...sales.map((sale) => new Date(sale.createdAt).getTime())),
        ),
      )
    : startOfDay(financialRangeEnd);
  const expenseBreakdown = calculateExpenseBreakdownBetween(
    financialRangeStart,
    financialRangeEnd,
    expenses,
    expenseHistory,
  );
  const fixedExpenses = expenseBreakdown.fixed;
  const totalExpenses = fixedExpenses;
  const netProfit = grossRevenue - soldProductCost - fixedExpenses;
  const lowStock = products.filter((product) => product.stock <= product.minStock);
  const lowFlavorStock = iceCreamFlavors.filter((flavor) => flavor.stock <= flavor.minStock);
  const unitsInStock = products.reduce((total, product) => total + product.stock, 0);
  const flavorUnitsInStock = iceCreamFlavors.reduce(
    (total, flavor) => total + flavor.stock,
    0,
  );

  const getCartQuantity = (productId: string) =>
    cart
      .filter((item) => item.productId === productId)
      .reduce((total, item) => total + item.quantity, 0);

  const addLineToCart = (product: Product, flavors: string[]) => {
    const currentQuantity = getCartQuantity(product.id);
    if (currentQuantity >= product.stock) {
      setNotice(`${product.name} no tiene stock disponible`);
      return;
    }

    const flavorKey = flavors.join("|");
    setCart((current) => {
      const existingLine = current.find(
        (item) =>
          item.productId === product.id && item.flavors.join("|") === flavorKey,
      );

      if (existingLine) {
        return current.map((item) =>
          item.lineId === existingLine.lineId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...current,
        {
          lineId: `${product.id}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
          productId: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          cost: product.cost,
          quantity: 1,
          unit: product.unit,
          imageUrl: product.imageUrl,
          flavors,
          flavorUsage: product.flavorUsage,
        },
      ];
    });
  };

  const handleProductClick = (product: Product) => {
    if (product.maxFlavors > 0) {
      setSelectedProduct(product);
      setSelectedFlavors([]);
      return;
    }

    addLineToCart(product, []);
  };

  const confirmFlavorSelection = () => {
    if (!selectedProduct) return;
    if (selectedFlavors.length !== selectedProduct.maxFlavors) {
      setNotice(
        `${selectedProduct.name} necesita ${selectedProduct.maxFlavors} gusto${
          selectedProduct.maxFlavors > 1 ? "s" : ""
        }`,
      );
      return;
    }

    addLineToCart(selectedProduct, selectedFlavors);
    setSelectedProduct(null);
    setSelectedFlavors([]);
  };

  const toggleFlavor = (flavorName: string) => {
    if (!selectedProduct) return;

    setSelectedFlavors((current) => {
      if (current.length >= selectedProduct.maxFlavors) {
        return current;
      }

      return [...current, flavorName];
    });
  };

  const removeSelectedFlavor = (index: number) => {
    setSelectedFlavors((current) =>
      current.filter((_flavor, flavorIndex) => flavorIndex !== index),
    );
  };

  const removeFromCart = (lineId: string) => {
    setCart((current) => {
      const line = current.find((item) => item.lineId === lineId);
      if (!line) return current;

      if (line.quantity <= 1) {
        return current.filter((item) => item.lineId !== lineId);
      }

      return current.map((item) =>
        item.lineId === lineId ? { ...item, quantity: item.quantity - 1 } : item,
      );
    });
  };

  const addQuantityToLine = (lineId: string) => {
    setCart((current) => {
      const line = current.find((item) => item.lineId === lineId);
      if (!line) return current;

      const product = products.find((item) => item.id === line.productId);
      const currentQuantity = current
        .filter((item) => item.productId === line.productId)
        .reduce((total, item) => total + item.quantity, 0);

      if (product && currentQuantity >= product.stock) {
        setNotice(`${line.name} no tiene stock disponible`);
        return current;
      }

      return current.map((item) =>
        item.lineId === lineId ? { ...item, quantity: item.quantity + 1 } : item,
      );
    });
  };

  const clearFromCart = (lineId: string) => {
    setCart((current) => current.filter((item) => item.lineId !== lineId));
  };

  const cancelCart = () => {
    setCart([]);
    setSelectedProduct(null);
    setSelectedFlavors([]);
    setNotice("Pedido cancelado");
  };

  const completeSale = async () => {
    if (!cartItems.length || isCharging) return;
    if (!paymentMethod) {
      setNotice("No hay metodos de pago cargados en la base");
      return;
    }

    setIsCharging(true);

    const saleTime = getCurrentTime();
    const cartSnapshot = cartItems;
    const productsSnapshot = products;
    const newSale: Sale = {
      id: `HF-${Date.now()}`,
      customer: customer.trim() || "Mostrador",
      items: cartSnapshot.reduce((total, item) => total + item.quantity, 0),
      method: paymentMethod,
      time: saleTime,
      total: saleTotal,
      subtotal: saleSubtotal,
      discount: saleDiscount,
      createdAt: new Date().toISOString(),
    };

    const soldQuantities = cartSnapshot.reduce<Record<string, number>>((acc, item) => {
      acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
      return acc;
    }, {});
    const soldEntries = Object.entries(soldQuantities);
    const soldFlavorQuantities = cartSnapshot.reduce<Record<string, number>>(
      (acc, item) => {
        const usagePerSelection =
          item.flavors.length > 0 ? item.flavorUsage / item.flavors.length : 0;
        item.flavors.forEach((flavorName) => {
          acc[flavorName] = (acc[flavorName] ?? 0) + item.quantity * usagePerSelection;
        });
        return acc;
      },
      {},
    );

    const flavorStockUpdates = Object.entries(soldFlavorQuantities).map(
      ([flavorName, quantity]) => {
        const flavor = iceCreamFlavors.find((item) => item.name === flavorName);
        return {
          id: flavor?.id ?? "",
          name: flavorName,
          stock: (flavor?.stock ?? 0) - quantity,
          currentStock: flavor?.stock ?? 0,
          quantity,
        };
      },
    );

    const missingFlavorStock = flavorStockUpdates.find((flavor) => !flavor.id);
    if (missingFlavorStock) {
      setNotice(`No se encontro el gusto ${missingFlavorStock.name} en la base`);
      return;
    }

    const saleItems = cartSnapshot.map((item) => ({
      venta_id: newSale.id,
      producto_id: item.productId,
      producto: item.flavors.length
        ? `${item.name} (${item.flavors.join(", ")})`
        : item.name,
      cantidad: item.quantity,
      precio: item.price,
      costo: item.cost,
      total: item.price * item.quantity,
      gustos: item.flavors,
    }));

    const inventoryMovements = soldEntries.map(([productId, quantity]) => ({
      sucursal_id: DEFAULT_BRANCH_ID,
      producto_id: productId,
      tipo: "venta",
      cantidad: -quantity,
      nota: `Pedido ${newSale.id}`,
    }));

    try {
      const response = await fetch("/api/erp/ventas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venta: {
            id: newSale.id,
            sucursal_id: DEFAULT_BRANCH_ID,
            cliente: newSale.customer,
            productos: newSale.items,
            metodo: newSale.method,
            subtotal: newSale.subtotal,
            descuento: newSale.discount,
            total: newSale.total,
            hora: saleTime,
            estado: "pagada",
          },
          items: saleItems,
          movimientos: inventoryMovements,
          stock: soldEntries.map(([productId, quantity]) => {
            const product = productsSnapshot.find((item) => item.id === productId);
            return {
              id: productId,
              stock: Math.max(0, (product?.stock ?? 0) - quantity),
            };
          }),
          stock_gustos: flavorStockUpdates.map((flavor) => ({
            id: flavor.id,
            stock: flavor.stock,
          })),
        }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        setIsSupabaseReady(false);
        setNotice(
          data?.error
            ? `No se pudo guardar el pedido: ${data.error}`
            : "No se pudo guardar el pedido en la base",
        );
        return;
      }

      setCart([]);
      setCustomer("Mostrador");
      await loadData(`Pedido ${newSale.id} cobrado por ${formatCurrency(saleTotal)}`);
      setIsSupabaseReady(true);
    } catch {
      setIsSupabaseReady(false);
      setNotice("No se pudo guardar el pedido en la base");
    } finally {
      setIsCharging(false);
    }
  };

  const saveProduct = async (product: ProductForm, previousStock?: number) => {
    const id = createAutomaticId(
      product.name,
      products.map((item) => item.id),
      product.id,
    );
    if (!id || !product.name.trim() || !product.category.trim()) {
      setNotice("CompletÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ nombre y rubro del producto");
      return false;
    }

    const response = await fetch("/api/erp/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        nombre: product.name.trim(),
        categoria: product.category.trim(),
        precio: product.price,
        costo: product.cost,
        stock: product.stock,
        stock_minimo: product.minStock,
        unidad: product.unit.trim() || "unid.",
        imagen: product.imageUrl.trim() || null,
        max_gustos: product.maxFlavors,
        consumo_gustos: product.flavorUsage,
        stock_anterior: previousStock,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setNotice(data?.error ?? "No se pudo guardar el producto");
      return false;
    }

    await loadData("Producto guardado en stock");
    return true;
  };

  const performDeleteProduct = async (product: Product) => {
    const response = await fetch("/api/erp/productos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: product.id }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setNotice(data?.error ?? "No se pudo eliminar el producto");
      return false;
    }

    await loadData("Producto eliminado");
    return true;
  };

  const deleteProduct = (product: Product) => {
    setDeleteConfirmation({
      title: "Eliminar producto",
      description: `Vas a ocultar ${product.name} del catalogo activo. Las ventas viejas siguen guardadas.`,
      confirmLabel: "Eliminar producto",
      onConfirm: () => performDeleteProduct(product),
    });
  };

  const updateExpense = (key: string, value: number) => {
    setExpenses((current) =>
      current.map((expense) =>
        expense.key === key ? { ...expense, amount: Math.max(0, value) } : expense,
      ),
    );
  };

  const saveExpenses = async () => {
    const response = await fetch("/api/erp/gastos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gastos: expenses.map((expense, index) => ({
          clave: expense.key,
          nombre: expense.label,
          categoria: expense.category,
          monto: expense.amount,
          orden: index + 1,
          activo: true,
        })),
      }),
    });

    if (!response.ok) {
      setNotice("No se pudieron guardar los gastos en la base");
      return;
    }

    await loadData("Gastos guardados y ganancia recalculada");
  };

  const saveEmployee = async (person: StaffForm) => {
    if (!person.name.trim() || !person.role.trim()) {
      setNotice("CompletÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ nombre y rol del empleado");
      return false;
    }

    const response = await fetch("/api/erp/empleados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: person.id,
        sucursal_id: DEFAULT_BRANCH_ID,
        nombre: person.name.trim(),
        rol: person.role.trim(),
        turno: person.shift.trim() || "Sin turno",
        sector: person.area.trim() || "General",
        estado: person.status,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setNotice(data?.error ?? "No se pudo guardar el empleado");
      return false;
    }

    await loadData("Empleado guardado");
    return true;
  };

  const saveFlavor = async (flavor: FlavorForm) => {
    if (!flavor.name.trim()) {
      setNotice("CompletÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡ el nombre del gusto");
      return false;
    }

    const id = createAutomaticId(
      flavor.name,
      iceCreamFlavors.map((item) => item.id),
      flavor.id,
    );

    const response = await fetch("/api/erp/gustos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        nombre: flavor.name.trim(),
        categoria: getFlavorCategoryName(flavor.category),
        disponible: flavor.available,
        color: flavor.color,
        stock: flavor.stock,
        stock_minimo: flavor.minStock,
        unidad: flavor.unit.trim() || "porciones",
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setNotice(data?.error ?? "No se pudo guardar el gusto");
      return false;
    }

    await loadData("Stock de gustos actualizado");
    return true;
  };

  const performDeleteFlavor = async (flavor: IceCreamFlavor) => {
    const response = await fetch("/api/erp/gustos", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: flavor.id }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setNotice(data?.error ?? "No se pudo eliminar el gusto");
      return false;
    }

    await loadData("Gusto eliminado");
    return true;
  };

  const deleteFlavor = (flavor: IceCreamFlavor) => {
    setDeleteConfirmation({
      title: "Eliminar gusto",
      description: `Vas a ocultar ${flavor.name} de caja y stock. El historial viejo sigue guardado.`,
      confirmLabel: "Eliminar gusto",
      onConfirm: () => performDeleteFlavor(flavor),
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation) return;

    setIsDeleting(true);
    const deleted = await deleteConfirmation.onConfirm();
    setIsDeleting(false);

    if (deleted) {
      setDeleteConfirmation(null);
    }
  };

  const loadFlavorBatch = async (
    flavor: IceCreamFlavor,
    kilos: number,
    portionsLoaded: number,
  ) => {
    const response = await fetch("/api/erp/tandas-gustos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "cargar",
        gusto_id: flavor.id,
        gusto: flavor.name,
        kilos,
        porciones_cargadas: portionsLoaded,
        stock_actual: flavor.stock,
        unidad: flavor.unit,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setNotice(data?.error ?? "No se pudo cargar el balde");
      return false;
    }

    await loadData(`Balde cargado para ${flavor.name}`);
    return true;
  };

  const closeFlavorBatch = async (batch: FlavorBatch, currentStock: number) => {
    const response = await fetch("/api/erp/tandas-gustos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accion: "cerrar",
        tanda_id: batch.id,
        gusto_id: batch.flavorId,
        stock_actual: currentStock,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      setNotice(data?.error ?? "No se pudo cerrar la tanda");
      return false;
    }

    const data = (await response.json()) as { sugerencia?: number };
    await loadData(
      `Tanda cerrada. Sugerencia siguiente: ${Math.round(data.sugerencia ?? 0)} porciones`,
    );
    return true;
  };

  const registerAttendance = async (
    person: StaffMember,
    eventType: AttendanceEvent,
  ) => {
    const response = await fetch("/api/erp/asistencias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sucursal_id: DEFAULT_BRANCH_ID,
        empleado_id: person.id ?? null,
        empleado: person.name,
        tipo: eventType,
        turno: getCurrentShift(),
      }),
    });

    if (!response.ok) {
      setNotice(`${person.name} registro ${eventType}; no se pudo guardar`);
      return;
    }

    await loadData(`${person.name} registro ${eventType}`);
  };

  return (
    <div className="min-h-screen bg-[#070809] text-zinc-100">
      <div className="mx-auto flex min-h-screen w-full max-w-[1680px]">
        <aside className="hidden w-72 shrink-0 border-r border-white/10 bg-[#0d0f10] lg:flex lg:flex-col">
          <div className="border-b border-white/10 p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-lg bg-cyan-300 text-zinc-950">
                <Snowflake className="size-6" />
              </div>
              <div>
                <p className="font-semibold leading-tight">Heladeria Facundo&apos;s</p>
              </div>
            </div>
          </div>

          <nav className="flex flex-1 flex-col gap-2 p-4">
            {navItems.map((item) => (
              <NavButton
                key={item.id}
                active={activeView === item.id}
                item={item}
                onClick={() => setActiveView(item.id)}
              />
            ))}
          </nav>

          <div className="border-t border-white/10 p-4">
            <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                <CheckCircle2 className="size-4" />
                Caja operativa
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                MaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ana y tarde separados en mÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©tricas
              </p>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-[#090b0d]/95 px-4 py-4 backdrop-blur md:px-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                  Heladeria / Cafeteria
                </p>
                <h1 className="mt-1 text-2xl font-semibold tracking-normal md:text-3xl">
                  Heladeria Facundo&apos;s
                </h1>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                  onClick={() => setIsHelpOpen(true)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <CircleHelp className="size-4" />
                  Ayuda
                </Button>
                <Badge className="max-w-80 truncate border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/10">
                  {notice}
                </Badge>
                {sessionEmail ? (
                  <>
                    <Badge className="max-w-56 truncate border-white/10 bg-white/5 text-zinc-200 hover:bg-white/5">
                      {sessionEmail}
                    </Badge>
                    <LogoutButton />
                  </>
                ) : (
                  <Button
                    asChild
                    className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                    size="sm"
                    variant="outline"
                  >
                    <Link href="/auth/login">Iniciar sesion</Link>
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {navItems.map((item) => (
                <NavButton
                  key={item.id}
                  active={activeView === item.id}
                  compact
                  item={item}
                  onClick={() => setActiveView(item.id)}
                />
              ))}
            </div>
          </header>

          <section className="px-4 py-5 md:px-6">
            {activeView === "caja" && (
              <CajaView
                cartItems={cartItems}
                category={category}
                categories={categories}
                clearFromCart={clearFromCart}
                completeSale={completeSale}
                confirmFlavorSelection={confirmFlavorSelection}
                filteredProducts={filteredProducts}
                flavors={iceCreamFlavors}
                addQuantityToLine={addQuantityToLine}
                cancelCart={cancelCart}
                handleProductClick={handleProductClick}
                isCharging={isCharging}
                lowFlavorStock={lowFlavorStock}
                lowStock={lowStock}
                paymentMethod={paymentMethod}
                paymentMethods={paymentMethods}
                query={query}
                removeFromCart={removeFromCart}
                removeSelectedFlavor={removeSelectedFlavor}
                saleDiscount={saleDiscount}
                saleSubtotal={saleSubtotal}
                saleTotal={saleTotal}
                selectedFlavors={selectedFlavors}
                selectedProduct={selectedProduct}
                setCategory={setCategory}
                setPaymentMethod={setPaymentMethod}
                setQuery={setQuery}
                setSelectedProduct={setSelectedProduct}
                toggleFlavor={toggleFlavor}
              />
            )}

            {activeView === "analisis" && (
              <AnalisisView
                expenses={expenses}
                expenseHistory={expenseHistory}
                paymentMethods={paymentMethods}
                saleItems={saleItems}
                sales={sales}
              />
            )}

            {activeView === "historial" && (
              <HistorialView
                expenses={expenses}
                expenseHistory={expenseHistory}
                saleItems={saleItems}
                sales={sales}
              />
            )}

            {activeView === "finanzas" && (
              <FinanzasView
                expenses={expenses}
                fixedExpenses={fixedExpenses}
                grossRevenue={grossRevenue}
                netProfit={netProfit}
                saveExpenses={saveExpenses}
                soldProductCost={soldProductCost}
                totalExpenses={totalExpenses}
                updateExpense={updateExpense}
              />
            )}

            {activeView === "empleados" && (
              <EmpleadosView
                attendance={attendance}
                registerAttendance={registerAttendance}
                saveEmployee={saveEmployee}
                staff={staff}
              />
            )}

            {activeView === "stock" && (
              <StockView
                closeFlavorBatch={closeFlavorBatch}
                deleteFlavor={deleteFlavor}
                deleteProduct={deleteProduct}
                flavors={iceCreamFlavors}
                flavorUnitsInStock={flavorUnitsInStock}
                flavorBatches={flavorBatches}
                loadFlavorBatch={loadFlavorBatch}
                lowStock={lowStock}
                lowFlavorStock={lowFlavorStock}
                products={products}
                saveProduct={saveProduct}
                saveFlavor={saveFlavor}
                unitsInStock={unitsInStock}
              />
            )}
          </section>

          <HelpModal
            help={activeHelp}
            isOpen={isHelpOpen}
            onClose={() => setIsHelpOpen(false)}
          />
          <DeleteConfirmModal
            confirmLabel={deleteConfirmation?.confirmLabel ?? "Eliminar"}
            description={deleteConfirmation?.description ?? ""}
            isLoading={isDeleting}
            isOpen={Boolean(deleteConfirmation)}
            onCancel={() => {
              if (!isDeleting) {
                setDeleteConfirmation(null);
              }
            }}
            onConfirm={confirmDelete}
            title={deleteConfirmation?.title ?? "Confirmar eliminacion"}
          />
        </main>
      </div>
    </div>
  );
}

function NavButton({
  active,
  compact,
  item,
  onClick,
}: {
  active: boolean;
  compact?: boolean;
  item: NavItem;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold transition",
        active
          ? "bg-cyan-300 text-zinc-950 shadow-[0_0_24px_rgba(103,232,249,0.18)]"
          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-100",
        compact && "shrink-0 border border-white/10 bg-[#111417]",
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-4" />
      {item.label}
    </button>
  );
}

function StatusBadge({ label, tone }: { label: string; tone: "cyan" | "amber" | "green" }) {
  const colors = {
    cyan: "border-cyan-300/20 bg-cyan-300/10 text-cyan-100",
    amber: "border-amber-300/20 bg-amber-300/10 text-amber-100",
    green: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
  };

  return (
    <Badge className={cn("max-w-full truncate hover:bg-inherit", colors[tone])}>
      {label}
    </Badge>
  );
}

function CajaView({
  cartItems,
  category,
  categories,
  clearFromCart,
  completeSale,
  confirmFlavorSelection,
  filteredProducts,
  flavors,
  addQuantityToLine,
  cancelCart,
  handleProductClick,
  isCharging,
  lowFlavorStock,
  lowStock,
  paymentMethod,
  paymentMethods,
  query,
  removeFromCart,
  removeSelectedFlavor,
  saleDiscount,
  saleSubtotal,
  saleTotal,
  selectedFlavors,
  selectedProduct,
  setCategory,
  setPaymentMethod,
  setQuery,
  setSelectedProduct,
  toggleFlavor,
}: {
  cartItems: CartLine[];
  category: string;
  categories: string[];
  clearFromCart: (id: string) => void;
  completeSale: () => void;
  confirmFlavorSelection: () => void;
  filteredProducts: Product[];
  flavors: IceCreamFlavor[];
  addQuantityToLine: (lineId: string) => void;
  cancelCart: () => void;
  handleProductClick: (product: Product) => void;
  isCharging: boolean;
  lowFlavorStock: IceCreamFlavor[];
  lowStock: Product[];
  paymentMethod: string;
  paymentMethods: string[];
  query: string;
  removeFromCart: (id: string) => void;
  removeSelectedFlavor: (index: number) => void;
  saleDiscount: number;
  saleSubtotal: number;
  saleTotal: number;
  selectedFlavors: string[];
  selectedProduct: Product | null;
  setCategory: (category: string) => void;
  setPaymentMethod: (method: string) => void;
  setQuery: (query: string) => void;
  setSelectedProduct: (product: Product | null) => void;
  toggleFlavor: (flavorName: string) => void;
}) {
  const realCategories = categories.filter((item) => item !== "Todos");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [lowStockView, setLowStockView] = useState<"productos" | "gustos">(
    "productos",
  );
  const [flavorSearch, setFlavorSearch] = useState("");
  const categorySelected = category !== "Todos";
  const cartQuantityByProduct = cartItems.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.productId] = (acc[item.productId] ?? 0) + item.quantity;
      return acc;
    },
    {},
  );
  const visibleFlavorGroups = groupFlavorsByCategory(
    flavors.filter((flavor) => {
      const normalizedQuery = flavorSearch.trim().toLowerCase();
      return (
        !normalizedQuery ||
        flavor.name.toLowerCase().includes(normalizedQuery) ||
        flavor.category.toLowerCase().includes(normalizedQuery)
      );
    }),
  );
  const displayedProducts = showLowStockOnly
    ? filteredProducts.filter((product) => product.stock <= product.minStock)
    : filteredProducts;
  const displayedLowFlavors = lowFlavorStock
    .filter((flavor) => {
      const normalizedQuery = query.trim().toLowerCase();
      return (
        !normalizedQuery ||
        flavor.name.toLowerCase().includes(normalizedQuery) ||
        flavor.category.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((left, right) => left.name.localeCompare(right.name, "es-AR"));
  const visibleCount =
    showLowStockOnly && lowStockView === "gustos"
      ? displayedLowFlavors.length
      : displayedProducts.length;
  const showCategoryBrowser = !categorySelected && !showLowStockOnly;
  const categoryCards = realCategories.map((item) => ({
      id: item,
      label: item,
      icon:
        item === "Helado"
          ? Snowflake
          : item === "Cafe"
            ? Coffee
            : item === "Salado"
              ? Store
              : item === "Dulce"
                ? ReceiptText
                : item === "Bebida"
                  ? CreditCard
                  : item === "Aperitivo"
                    ? WalletCards
                    : item === "Desayuno"
                      ? SunMedium
                      : item === "Promo"
                        ? BadgeDollarSign
                        : Package,
      subtitle: "Abrir categoria",
    }));

  useEffect(() => {
    setFlavorSearch("");
  }, [selectedProduct]);

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
      <DarkPanel className="overflow-hidden">
        <PanelHeader
          icon={ShoppingCart}
          title="Caja"
          subtitle="Elegi una categoria y despues el producto"
          right={
            <div className="flex flex-wrap items-center gap-2">
              <Button
                className={cn(
                  "border-amber-300/30 font-semibold hover:bg-amber-300/20",
                  showLowStockOnly
                    ? "bg-amber-300 text-zinc-950"
                    : "bg-amber-300/10 text-amber-100",
                )}
                onClick={() => {
                  setShowLowStockOnly((current) => !current);
                  setLowStockView("productos");
                  setQuery("");
                }}
                size="sm"
                type="button"
                variant="outline"
              >
                <TimerReset className="size-4" />
                Bajo stock
              </Button>
              <StatusBadge
                tone={showLowStockOnly ? "amber" : "cyan"}
                label={`${visibleCount} visibles`}
              />
            </div>
          }
        />

        {showCategoryBrowser ? (
          <div className="space-y-4 p-4">
            <div>
              <p className="font-semibold text-zinc-100">Categorias</p>
              <p className="mt-1 text-sm text-zinc-500">
                Toca una categoria para ver sus productos.
              </p>
            </div>

            {(lowStock.length > 0 || lowFlavorStock.length > 0) && (
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-amber-100">
                      Hay cosas para reponer
                    </p>
                    <p className="mt-1 text-sm text-amber-50/80">
                      {lowStock.length} producto{lowStock.length === 1 ? "" : "s"} y{" "}
                      {lowFlavorStock.length} gusto
                      {lowFlavorStock.length === 1 ? "" : "s"} estan en bajo stock.
                    </p>
                  </div>
                  <Button
                    className="border-amber-300/30 bg-black/20 text-amber-100 hover:bg-black/30"
                    onClick={() => {
                      setShowLowStockOnly(true);
                      setLowStockView("productos");
                      setQuery("");
                    }}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Ver faltantes
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {categoryCards.map((item) => {
              const Icon = item.icon;

              return (
              <button
                className={cn(
                  "flex min-h-28 items-center gap-4 rounded-lg border p-4 text-left transition",
                  "border-white/10 bg-white/5 text-zinc-300 hover:border-cyan-300/40 hover:bg-white/10",
                )}
                key={item.id}
                onClick={() => setCategory(item.id)}
                type="button"
              >
                <div
                  className={cn(
                    "flex size-12 items-center justify-center rounded-lg border",
                    "border-white/10 bg-black/20 text-cyan-200",
                  )}
                >
                  <Icon className="size-6" />
                </div>
                <div>
                  <p className="text-base font-semibold">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-500">{item.subtitle}</p>
                </div>
              </button>
            )})}
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-4">
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="shrink-0">
                    <Button
                      className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                      onClick={() => {
                        if (showLowStockOnly) {
                          setShowLowStockOnly(false);
                        }
                        setCategory("Todos");
                        setQuery("");
                      }}
                      type="button"
                      variant="outline"
                    >
                      <ArrowLeft className="size-4" />
                      Volver
                    </Button>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-zinc-100">
                      {showLowStockOnly && !categorySelected ? "Bajo stock" : category}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {showLowStockOnly && lowStockView === "gustos"
                        ? `${displayedLowFlavors.length} gusto${displayedLowFlavors.length === 1 ? "" : "s"}`
                        : `${displayedProducts.length} producto${displayedProducts.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </div>

                <div className="w-full lg:w-auto">
                  <div className="relative lg:w-[320px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      className="h-11 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60"
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder={
                        showLowStockOnly && !categorySelected
                          ? "Buscar faltantes"
                          : `Buscar en ${category.toLowerCase()}`
                      }
                      value={query}
                    />
                  </div>
                </div>
              </div>
            </div>

            {showLowStockOnly && (
              <div
                className={cn(
                  "rounded-lg border px-4 py-3",
                  showLowStockOnly
                    ? "border-amber-300/20 bg-amber-300/10"
                    : "border-white/10 bg-black/20",
                )}
              >
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-zinc-100">
                      Bajo stock
                    </p>
                    <p className="mt-1 text-sm text-zinc-500">
                      {showLowStockOnly && lowStockView === "gustos"
                        ? `${lowFlavorStock.length} gusto${lowFlavorStock.length === 1 ? "" : "s"} estan en o por debajo del minimo.`
                        : `${lowStock.length} producto${lowStock.length === 1 ? "" : "s"} estan en o por debajo del minimo.`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className={cn(
                        "font-semibold hover:bg-amber-300/20",
                        lowStockView === "productos"
                          ? "border-amber-300 bg-amber-300 text-zinc-950"
                          : "border-amber-300/30 bg-white/5 text-zinc-100",
                      )}
                      onClick={() => setLowStockView("productos")}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Productos
                    </Button>
                    <Button
                      className={cn(
                        "font-semibold hover:bg-amber-300/20",
                        lowStockView === "gustos"
                          ? "border-amber-300 bg-amber-300 text-zinc-950"
                          : "border-amber-300/30 bg-white/5 text-zinc-100",
                      )}
                      onClick={() => setLowStockView("gustos")}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Gustos
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {(!showLowStockOnly || lowStockView === "productos") && (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {displayedProducts.map((product) => {
                const quantityInCart = cartQuantityByProduct[product.id] ?? 0;
                const reachedLimit = quantityInCart >= product.stock;
                const unavailable = product.stock <= 0 || reachedLimit;
                const isLow = product.stock <= product.minStock;

                return (
                  <button
                    className={cn(
                      "group overflow-hidden rounded-lg border text-left transition disabled:cursor-not-allowed",
                      unavailable
                        ? "border-white/5 bg-zinc-900/70 opacity-45 grayscale"
                        : isLow
                          ? "border-amber-300/40 bg-[#191512] hover:-translate-y-0.5 hover:border-amber-300/60"
                        : "border-white/10 bg-[#121516] hover:-translate-y-0.5 hover:border-cyan-300/50 hover:bg-[#161b1c]",
                    )}
                    disabled={unavailable}
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    type="button"
                  >
                    <div className="relative aspect-[4/3] bg-black">
                      {product.imageUrl ? (
                        <img
                          alt={product.name}
                          className="size-full object-cover transition duration-300 group-hover:scale-105"
                          src={product.imageUrl}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center bg-[#0f1213] text-zinc-500">
                          <div className="flex flex-col items-center gap-2">
                            <Package className="size-8" />
                            <span className="text-sm font-semibold">Sin foto</span>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                        <Badge className="border-white/10 bg-black/50 text-zinc-100 hover:bg-black/50">
                          {reachedLimit
                            ? "Limite en carrito"
                            : isLow
                              ? "Bajo stock"
                            : product.maxFlavors > 0
                              ? `Hasta ${product.maxFlavors} gusto${
                                  product.maxFlavors > 1 ? "s" : ""
                                }`
                              : product.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="min-h-10 font-semibold leading-snug text-zinc-100">
                        {product.name}
                      </p>
                      <div className="mt-3 flex items-end justify-between gap-3">
                        <p className="text-lg font-semibold text-cyan-100">
                          {formatCurrency(product.price)}
                        </p>
                        <p className={cn("text-xs", isLow ? "text-amber-200" : "text-zinc-500")}>
                          {quantityInCart}/{product.stock} {product.unit}
                        </p>
                      </div>
                    </div>
                  </button>
                );
                })}
              </div>
            )}

            {showLowStockOnly && lowStockView === "gustos" && (
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                {displayedLowFlavors.map((flavor) => (
                  <div
                    className="rounded-lg border border-amber-300/30 bg-[#191512] p-4"
                    key={flavor.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="size-3 rounded-full border border-black/10"
                            style={{ backgroundColor: flavor.color }}
                          />
                          <p className="truncate font-semibold text-zinc-100">
                            {flavor.name}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
                            {flavor.category}
                          </Badge>
                        </div>
                      </div>
                      <Badge className="shrink-0 border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/10">
                        Reponer
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-xs uppercase text-zinc-500">Stock</p>
                        <p className="mt-2 text-2xl font-semibold leading-none text-amber-100">
                          {flavor.stock}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {flavor.unit}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
                        <p className="text-xs uppercase text-zinc-500">Minimo</p>
                        <p className="mt-2 text-2xl font-semibold leading-none text-zinc-100">
                          {flavor.minStock}
                        </p>
                        <p className="mt-1 text-xs text-zinc-500">
                          {flavor.unit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {((!showLowStockOnly || lowStockView === "productos") && !displayedProducts.length) && (
              <div className="rounded-lg border border-white/10 bg-black/20 p-5 text-center text-sm text-zinc-500">
                No hay productos para mostrar con ese filtro.
              </div>
            )}

            {showLowStockOnly && lowStockView === "gustos" && !displayedLowFlavors.length && (
              <div className="rounded-lg border border-white/10 bg-black/20 p-5 text-center text-sm text-zinc-500">
                No hay gustos para mostrar con ese filtro.
              </div>
            )}
          </div>
        )}

        {selectedProduct && (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#101315] shadow-2xl">
              <div className="grid md:grid-cols-[260px_1fr]">
                <div className="relative min-h-56 bg-black">
                  {selectedProduct.imageUrl ? (
                    <img
                      alt={selectedProduct.name}
                      className="absolute inset-0 size-full object-cover"
                      src={selectedProduct.imageUrl}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#0f1213] text-zinc-500">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="size-10" />
                        <span className="text-sm font-semibold">Sin foto</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                  <button
                    className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-sm font-semibold text-zinc-100"
                    onClick={() => setSelectedProduct(null)}
                    type="button"
                  >
                    Cerrar
                  </button>
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-xl font-semibold">{selectedProduct.name}</p>
                    <p className="mt-1 text-sm text-zinc-300">
                      ElegÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­ {selectedProduct.maxFlavors} gusto
                      {selectedProduct.maxFlavors > 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  {selectedProduct.maxFlavors > 0 && selectedProduct.flavorUsage > 0 && (
                    <div className="mb-3 rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-3 py-2 text-xs text-cyan-100">
                      Este producto descuenta {selectedProduct.flavorUsage} porciones estimadas en total.
                    </div>
                  )}
                  <div className="mb-3 rounded-lg border border-amber-300/20 bg-amber-300/10 px-3 py-2 text-xs text-amber-100">
                    Si el stock estimado de un gusto llega a cero, igual podÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©s vender y el sistema lo deja en negativo para recalibrar la prÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³xima tanda.
                  </div>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-100">Gustos disponibles</p>
                      <p className="text-sm text-zinc-500">
                        {selectedFlavors.length}/{selectedProduct.maxFlavors} seleccionados
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-cyan-100">
                      {formatCurrency(selectedProduct.price)}
                    </p>
                  </div>

                  <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                    <input
                      className="h-11 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60"
                      onChange={(event) => setFlavorSearch(event.target.value)}
                      placeholder="Buscar sabor rapido"
                      value={flavorSearch}
                    />
                  </div>

                  <div className="mb-3 min-h-11 rounded-lg border border-white/10 bg-black/20 p-2">
                    {selectedFlavors.length ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedFlavors.map((flavor, index) => (
                          <button
                            className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-300/20"
                            key={`${flavor}-${index}`}
                            onClick={() => removeSelectedFlavor(index)}
                            type="button"
                          >
                            {index + 1}. {flavor} x
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="px-1 py-1.5 text-xs text-zinc-500">
                        Toca los gustos. PodÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â©s repetir el mismo sabor.
                      </p>
                    )}
                  </div>

                  <div className="max-h-[420px] space-y-4 overflow-y-auto pr-1">
                    {visibleFlavorGroups.map((group) => (
                      <div className="space-y-2" key={group.category}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-zinc-100">
                            {group.category}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {group.items.length} gusto{group.items.length === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {group.items.map((flavor) => {
                            const selectedCount = selectedFlavors.filter(
                              (item) => item === flavor.name,
                            ).length;
                            const selected = selectedCount > 0;
                            const usagePerSelection =
                              selectedProduct.maxFlavors > 0
                                ? selectedProduct.flavorUsage / selectedProduct.maxFlavors
                                : 0;
                            const projectedCount = selectedCount + 1;
                            const projectedUsage = projectedCount * usagePerSelection;
                            const noFlavorStockLeft = projectedUsage > flavor.stock;
                            const disabled =
                              selectedFlavors.length >= selectedProduct.maxFlavors;

                            return (
                              <button
                                className={cn(
                                  "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                                  selected
                                    ? "border-cyan-300 bg-cyan-300 text-zinc-950"
                                    : noFlavorStockLeft
                                      ? "border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
                                      : "border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10",
                                  disabled && "cursor-not-allowed opacity-45",
                                )}
                                disabled={disabled}
                                key={`${group.category}-${flavor.id}`}
                                onClick={() => toggleFlavor(flavor.name)}
                                type="button"
                              >
                                <span
                                  className="size-5 rounded-full border border-black/10"
                                  style={{ backgroundColor: flavor.color }}
                                />
                                <div>
                                  <span className="font-semibold">{flavor.name}</span>
                                  <p className="text-xs opacity-75">
                                    {flavor.stock} {flavor.unit}
                                  </p>
                                </div>
                                {selectedCount > 0 && (
                                  <span className="ml-auto rounded-md bg-black/20 px-2 py-0.5 text-xs font-semibold">
                                    x{selectedCount}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {!visibleFlavorGroups.length && (
                      <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-center text-sm text-zinc-500">
                        No hay gustos que coincidan con esa busqueda.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button
                      className="h-11 flex-1 bg-cyan-300 font-semibold text-zinc-950 hover:bg-cyan-200"
                      disabled={selectedFlavors.length !== selectedProduct.maxFlavors}
                      onClick={confirmFlavorSelection}
                      type="button"
                    >
                      Agregar al pedido
                    </Button>
                    <Button
                      className="h-11 border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                      onClick={() => setSelectedProduct(null)}
                      type="button"
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </DarkPanel>

      <div>
        <DarkPanel className="xl:sticky xl:top-28">
          <PanelHeader
            icon={ReceiptText}
            title="Pedido"
            subtitle={`${cartItems.length} lineas`}
          />
          <div className="min-h-72 divide-y divide-white/10">
            {cartItems.length ? (
              cartItems.map((item) => (
                <div className="p-3" key={item.lineId}>
                  <div className="flex gap-3">
                    {item.imageUrl ? (
                      <img
                        alt={item.name}
                        className="size-16 rounded-lg object-cover"
                        src={item.imageUrl}
                      />
                    ) : (
                      <div className="flex size-16 items-center justify-center rounded-lg bg-white/5 text-zinc-500">
                        <Package className="size-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold leading-snug text-zinc-100">
                            {item.name}
                          </p>
                          {item.flavors.length > 0 && (
                            <p className="mt-1 text-xs text-cyan-100">
                              {item.flavors.join(", ")}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-zinc-500">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                        <button
                          className="rounded-lg p-2 text-zinc-500 transition hover:bg-white/10 hover:text-zinc-100"
                          onClick={() => clearFromCart(item.lineId)}
                          type="button"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <IconButton onClick={() => removeFromCart(item.lineId)}>
                            <Minus className="size-4" />
                          </IconButton>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <IconButton onClick={() => addQuantityToLine(item.lineId)}>
                            <Plus className="size-4" />
                          </IconButton>
                        </div>
                        <p className="font-semibold text-zinc-100">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                <ShoppingCart className="mb-3 size-8 text-zinc-600" />
                <p className="font-semibold text-zinc-200">Pedido vacio</p>
                <p className="text-xs text-zinc-500">
                  Toca una imagen para agregar productos.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-3 border-t border-white/10 p-4">
            <div className="grid grid-cols-2 gap-2">
              {paymentMethods.map((method) => (
                <button
                  className={cn(
                    "rounded-lg border px-3 py-2 text-xs font-semibold transition",
                    paymentMethod === method
                      ? "border-emerald-300 bg-emerald-300 text-zinc-950"
                      : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
                  )}
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  type="button"
                >
                  {method}
                </button>
              ))}
            </div>
            <TotalRow label="Subtotal" value={formatCurrency(saleSubtotal)} />
            <TotalRow label="Descuento" value={`-${formatCurrency(saleDiscount)}`} />
            <TotalRow strong label="Total a cobrar" value={formatCurrency(saleTotal)} />

            <Button
              className="h-12 w-full bg-cyan-300 font-semibold text-zinc-950 hover:bg-cyan-200"
              disabled={!cartItems.length || isCharging}
              onClick={completeSale}
              type="button"
            >
              <CreditCard className="size-4" />
              {isCharging ? "Guardando venta" : "Cobrar pedido"}
            </Button>
            <Button
              className="h-11 w-full border-white/10 bg-white/5 font-semibold text-zinc-100 hover:bg-white/10"
              disabled={!cartItems.length}
              onClick={cancelCart}
              type="button"
              variant="outline"
            >
              <Trash2 className="size-4" />
              Cancelar pedido
            </Button>
          </div>
        </DarkPanel>
      </div>
    </div>
  );
}

function AnalisisView({
  expenses,
  expenseHistory,
  paymentMethods,
  saleItems,
  sales,
}: {
  expenses: Expense[];
  expenseHistory: ExpenseHistory[];
  paymentMethods: string[];
  saleItems: SaleItem[];
  sales: Sale[];
}) {
  const now = new Date();
  const [activePanel, setActivePanel] = useState<
    "resumen" | "rankings" | "ventas" | "historico" | "gastos"
  >("resumen");
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = endOfDay(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= monthStart && saleDate <= monthEnd;
  });
  const grossRevenue = filteredSales.reduce((total, sale) => total + sale.total, 0);
  const expenseBreakdown = calculateExpenseBreakdownBetween(
    monthStart,
    monthEnd,
    expenses,
    expenseHistory,
  );
  const fixedExpenses = expenseBreakdown.fixed;
  const morningRevenue = filteredSales
    .filter((sale) => getSaleHour(sale) < 14)
    .reduce((total, sale) => total + sale.total, 0);
  const afternoonRevenue = filteredSales
    .filter((sale) => getSaleHour(sale) >= 14)
    .reduce((total, sale) => total + sale.total, 0);
  const filteredSaleItems = saleItems.filter((item) => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= monthStart && itemDate <= monthEnd;
  });
  const soldProductCost = filteredSaleItems.reduce(
    (total, item) => total + item.cost * item.quantity,
    0,
  );
  const netProfit = grossRevenue - soldProductCost - fixedExpenses;
  const soldProducts = filteredSaleItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const methodTotals = [
    ...new Set([
      ...paymentMethods,
      ...filteredSales.map((sale) => sale.method),
    ]),
  ].map((method) => ({
    method,
    total: filteredSales
      .filter((sale) => sale.method === method)
      .reduce((sum, sale) => sum + sale.total, 0),
  }));
  const maxMethodTotal = Math.max(...methodTotals.map((item) => item.total), 1);
  const yearlyTotals = sales.reduce<Record<string, number>>((acc, sale) => {
    const year = new Date(sale.createdAt).getFullYear().toString();
    acc[year] = (acc[year] ?? 0) + sale.total;
    return acc;
  }, {});
  const yearlyRows = Object.entries(yearlyTotals)
    .sort(([left], [right]) => Number(right) - Number(left))
    .map(([year, total]) => ({ year, total }));
  const topProducts = Object.entries(
    filteredSaleItems.reduce<Record<string, number>>((acc, item) => {
      const normalizedName = item.product.replace(/\s*\([^)]*\)\s*$/, "").trim();
      acc[normalizedName] = (acc[normalizedName] ?? 0) + item.quantity;
      return acc;
    }, {}),
  )
    .sort(([, left], [, right]) => right - left)
    .slice(0, 6);
  const topFlavors = Object.entries(
    filteredSaleItems.reduce<Record<string, number>>((acc, item) => {
      item.flavors.forEach((flavor) => {
        acc[flavor] = (acc[flavor] ?? 0) + item.quantity;
      });
      return acc;
    }, {}),
  )
    .sort(([, left], [, right]) => right - left)
    .slice(0, 6);
  const maxTopProduct = Math.max(...topProducts.map(([, total]) => total), 1);
  const maxTopFlavor = Math.max(...topFlavors.map(([, total]) => total), 1);
  const saleDetailsById = filteredSaleItems.reduce<Record<string, SaleItem[]>>(
    (acc, item) => {
      acc[item.saleId] = [...(acc[item.saleId] ?? []), item];
      return acc;
    },
    {},
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={ArrowUpCircle}
          label="Total vendido sin restar"
          tone="cyan"
          value={formatCurrency(grossRevenue)}
        />
        <MetricCard
          icon={ArrowDownCircle}
          label="Costo de productos vendidos"
          tone="amber"
          value={formatCurrency(soldProductCost)}
        />
        <MetricCard
          icon={WalletCards}
          label="Gastos fijos"
          tone={fixedExpenses > 0 ? "amber" : "neutral"}
          value={formatCurrency(fixedExpenses)}
        />
        <MetricCard
          icon={ReceiptText}
          label="Productos vendidos"
          tone="neutral"
          value={String(soldProducts)}
        />
        <MetricCard
          icon={BadgeDollarSign}
          label="Ganancia real"
          tone={netProfit >= 0 ? "green" : "red"}
          value={formatCurrency(netProfit)}
        />
      </div>

      <DarkPanel>
        <div className="flex flex-wrap gap-2 p-4">
          {[
            { id: "resumen", label: "Resumen" },
            { id: "rankings", label: "Rankings" },
            { id: "ventas", label: "Ventas" },
            { id: "historico", label: "Historico" },
            { id: "gastos", label: "Gastos" },
          ].map((tab) => (
            <button
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                activePanel === tab.id
                  ? "border-cyan-300 bg-cyan-300 text-zinc-950"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
              )}
              key={tab.id}
              onClick={() =>
                setActivePanel(
                  tab.id as "resumen" | "rankings" | "ventas" | "historico" | "gastos",
                )
              }
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </DarkPanel>

      {activePanel === "resumen" && (
      <div className="grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
        <DarkPanel>
          <PanelHeader
            icon={LayoutDashboard}
            title="Ventas por turno"
            subtitle="MaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ana antes de las 14:00, tarde desde las 14:00"
          />
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <ShiftCard label="MaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±ana" value={morningRevenue} icon={Coffee} />
            <ShiftCard label="Tarde" value={afternoonRevenue} icon={Flame} />
          </div>
        </DarkPanel>

        <DarkPanel>
          <PanelHeader
            icon={BarChart3}
            title="Ventas por metodo de pago"
            subtitle="Distribucion de ingresos"
          />
          <div className="space-y-4 p-4">
            {methodTotals.map((item) => (
              <div key={item.method}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-zinc-200">{item.method}</span>
                  <span className="text-zinc-400">{formatCurrency(item.total)}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-cyan-300"
                    style={{ width: `${(item.total / maxMethodTotal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </DarkPanel>
      </div>
      )}

      {activePanel === "rankings" && (
      <div className="grid gap-5 xl:grid-cols-2">
        <DarkPanel>
          <PanelHeader
            icon={Snowflake}
            title="Ranking de gustos"
            subtitle="Los sabores mas pedidos del mes"
          />
          <div className="space-y-4 p-4">
            {topFlavors.length ? (
              topFlavors.map(([flavor, total], index) => (
                <div key={flavor}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-zinc-300">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-zinc-200">{flavor}</span>
                    </div>
                    <span className="text-zinc-400">{total} pedidos</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-cyan-300"
                      style={{ width: `${(total / maxTopFlavor) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                Todavia no hay gustos vendidos este mes.
              </p>
            )}
          </div>
        </DarkPanel>

        <DarkPanel>
          <PanelHeader
            icon={Package}
            title="Ranking de productos"
            subtitle="Los productos mas vendidos del mes"
          />
          <div className="space-y-4 p-4">
            {topProducts.length ? (
              topProducts.map(([product, total], index) => (
                <div key={product}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex size-7 items-center justify-center rounded-lg bg-white/5 text-xs font-semibold text-zinc-300">
                        {index + 1}
                      </span>
                      <span className="font-semibold text-zinc-200">{product}</span>
                    </div>
                    <span className="text-zinc-400">{total} vendidos</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/10">
                    <div
                      className="h-2 rounded-full bg-cyan-300"
                      style={{ width: `${(total / maxTopProduct) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-zinc-500">
                Todavia no hay productos vendidos este mes.
              </p>
            )}
          </div>
        </DarkPanel>
      </div>
      )}

      {activePanel === "ventas" && (
      <DarkPanel>
        <PanelHeader
          icon={ReceiptText}
          title="Detalle de ventas"
          subtitle={`${filteredSales.length} comprobantes en el periodo`}
        />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase text-zinc-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Pedido</th>
                <th className="px-4 py-3 font-semibold">Cliente</th>
                <th className="px-4 py-3 font-semibold">Hora</th>
                <th className="px-4 py-3 font-semibold">Metodo</th>
                <th className="px-4 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredSales.map((sale) => {
                const saleDetails = saleDetailsById[sale.id] ?? [];
                const firstItem = saleDetails[0];
                const hiddenCount = Math.max(saleDetails.length - 1, 0);
                const isExpanded = expandedSaleId === sale.id;

                return (
                  <Fragment key={sale.id}>
                    <tr
                      className="cursor-pointer transition hover:bg-white/[0.03]"
                      onClick={() =>
                        setExpandedSaleId((current) =>
                          current === sale.id ? null : sale.id,
                        )
                      }
                    >
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="font-semibold text-zinc-200">
                            {firstItem
                              ? `${firstItem.quantity}x ${firstItem.product}`
                              : "Venta sin detalle"}
                          </p>
                          {hiddenCount > 0 && (
                            <p className="text-xs text-zinc-500">
                              + {hiddenCount} producto{hiddenCount > 1 ? "s" : ""} mas
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{sale.customer}</td>
                      <td className="px-4 py-3 text-zinc-400">{sale.time}</td>
                      <td className="px-4 py-3 text-zinc-400">{sale.method}</td>
                      <td className="px-4 py-3 text-right font-semibold text-emerald-200">
                        {formatCurrency(sale.total)}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td className="bg-black/20 px-4 py-4" colSpan={5}>
                          <div className="space-y-4">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs uppercase text-zinc-500">Cliente</p>
                                <p className="mt-2 font-semibold text-zinc-100">
                                  {sale.customer}
                                </p>
                              </div>
                              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs uppercase text-zinc-500">Metodo</p>
                                <p className="mt-2 font-semibold text-zinc-100">
                                  {sale.method}
                                </p>
                              </div>
                              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs uppercase text-zinc-500">Fecha y hora</p>
                                <p className="mt-2 font-semibold text-zinc-100">
                                  {formatFullDateTime(sale.createdAt)}
                                </p>
                              </div>
                              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs uppercase text-zinc-500">Total</p>
                                <p className="mt-2 font-semibold text-emerald-200">
                                  {formatCurrency(sale.total)}
                                </p>
                              </div>
                            </div>

                            <div className="rounded-lg border border-white/10 bg-white/[0.03]">
                              <div className="border-b border-white/10 px-4 py-3">
                                <p className="font-semibold text-zinc-100">
                                  Productos del pedido
                                </p>
                              </div>
                              <div className="divide-y divide-white/10">
                                {saleDetails.map((item) => (
                                  <div
                                    className="flex items-start justify-between gap-4 px-4 py-3"
                                    key={item.id}
                                  >
                                    <div>
                                      <p className="font-semibold text-zinc-100">
                                        {item.quantity}x {item.product}
                                      </p>
                                      {!!item.flavors.length && (
                                        <p className="mt-1 text-xs text-zinc-500">
                                          Gustos: {item.flavors.join(", ")}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs uppercase text-zinc-500">Subtotal</p>
                                <p className="mt-2 font-semibold text-zinc-100">
                                  {formatCurrency(sale.subtotal)}
                                </p>
                              </div>
                              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs uppercase text-zinc-500">Descuento</p>
                                <p className="mt-2 font-semibold text-amber-200">
                                  {formatCurrency(sale.discount)}
                                </p>
                              </div>
                              <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                                <p className="text-xs uppercase text-zinc-500">Total final</p>
                                <p className="mt-2 font-semibold text-emerald-200">
                                  {formatCurrency(sale.total)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </DarkPanel>
      )}

      {activePanel === "historico" && (
      <DarkPanel>
        <PanelHeader
          icon={CalendarClock}
          title="HistÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico por aÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±o"
          subtitle="Resumen de todos los aÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±os registrados"
        />
        <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-4">
          {yearlyRows.length ? (
            yearlyRows.map((row) => (
              <div
                className="rounded-lg border border-white/10 bg-black/20 p-4"
                key={row.year}
              >
                <p className="text-sm text-zinc-500">AÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±o {row.year}</p>
                <p className="mt-2 text-xl font-semibold text-cyan-100">
                  {formatCurrency(row.total)}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-zinc-500">TodavÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â­a no hay ventas histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³ricas.</p>
          )}
        </div>
      </DarkPanel>
      )}

      {activePanel === "gastos" && (
      <DarkPanel>
        <PanelHeader
          icon={DollarSign}
          title="Resumen de costos y gastos"
          subtitle="Todo lo que se resta para calcular la ganancia real"
        />
        <div className="grid gap-5 p-4 xl:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-500">Costo de productos vendidos</p>
            <p className="mt-2 text-2xl font-semibold text-amber-100">
              {formatCurrency(soldProductCost)}
            </p>
          </div>
          <div className="rounded-lg border border-white/10 bg-black/20 p-4">
            <p className="text-sm text-zinc-500">Gastos fijos</p>
            <p className="mt-2 text-2xl font-semibold text-amber-100">
              {formatCurrency(fixedExpenses)}
            </p>
          </div>
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-4">
            <p className="text-sm text-emerald-100">Ganancia real</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-200">
              {formatCurrency(netProfit)}
            </p>
          </div>
        </div>
      </DarkPanel>
      )}
    </div>
  );
}

type HistoryRow = {
  label: string;
  dateLabel?: string;
  gross: number;
  net: number;
  items: number;
};

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const dayNames = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

const endOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
};

const normalizeExpenseCategory = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isProductionExpense = (expense: { category: string }) =>
  normalizeExpenseCategory(expense.category) === "produccion";

const currentExpenseBreakdown = (expenses: Expense[]) =>
  expenses.reduce(
    (acc, expense) => {
      if (!isProductionExpense(expense)) {
        acc.fixed += expense.amount;
        acc.total += expense.amount;
      }
      return acc;
    },
    { fixed: 0, production: 0, total: 0 },
  );

const getExpenseBreakdownForDate = (
  date: Date,
  expenses: Expense[],
  expenseHistory: ExpenseHistory[],
) => {
  const sortedHistory = [...expenseHistory].sort(
    (left, right) =>
      new Date(left.startsAt).getTime() - new Date(right.startsAt).getTime(),
  );
  const activeSnapshot = sortedHistory
    .filter((snapshot) => new Date(snapshot.startsAt) <= date)
    .at(-1);
  const sourceExpenses =
    activeSnapshot?.expenses ??
    sortedHistory[0]?.expenses ??
    expenses;

  return currentExpenseBreakdown(sourceExpenses);
};

const calculateExpenseBreakdownBetween = (
  start: Date,
  end: Date,
  expenses: Expense[],
  expenseHistory: ExpenseHistory[],
) => {
  const breakdown = { fixed: 0, production: 0, total: 0 };
  const cursor = startOfDay(start);
  const finalDay = startOfDay(end);

  while (cursor <= finalDay) {
    const snapshot = getExpenseBreakdownForDate(
      endOfDay(cursor),
      expenses,
      expenseHistory,
    );
    breakdown.fixed += snapshot.fixed / 30;
    breakdown.production += snapshot.production / 30;
    breakdown.total += snapshot.total / 30;
    cursor.setDate(cursor.getDate() + 1);
  }

  return breakdown;
};

const formatShortDate = (date: Date) =>
  new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
  })
    .format(date)
    .replace(".", "");

const getSalesBetween = (sales: Sale[], start: Date, end: Date) =>
  sales.filter((sale) => {
    const saleDate = new Date(sale.createdAt);
    return saleDate >= start && saleDate <= end;
  });

const getSaleItemsBetween = (saleItems: SaleItem[], start: Date, end: Date) =>
  saleItems.filter((item) => {
    const itemDate = new Date(item.createdAt);
    return itemDate >= start && itemDate <= end;
  });

const summarizeSales = (
  sales: Sale[],
  saleItems: SaleItem[],
  expenseBreakdown: { total: number },
): HistoryRow => {
  const gross = sales.reduce((total, sale) => total + sale.total, 0);
  const items = sales.reduce((total, sale) => total + sale.items, 0);
  const soldProductCost = saleItems.reduce(
    (total, item) => total + item.cost * item.quantity,
    0,
  );

  return {
    label: "",
    gross,
    net: gross - soldProductCost - expenseBreakdown.total,
    items,
  };
};

function HistorialView({
  expenses,
  expenseHistory,
  saleItems,
  sales,
}: {
  expenses: Expense[];
  expenseHistory: ExpenseHistory[];
  saleItems: SaleItem[];
  sales: Sale[];
}) {
  const [activeHistoryView, setActiveHistoryView] = useState<
    "diario" | "semanal" | "mensual" | "anual"
  >("diario");
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();

  const weeklyRows = Array.from({ length: 4 }, (_, index) => {
    const end = endOfDay(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - index * 7,
      ),
    );
    const start = startOfDay(
      new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6),
    );
    const summary = summarizeSales(
      getSalesBetween(sales, start, end),
      getSaleItemsBetween(saleItems, start, end),
      calculateExpenseBreakdownBetween(start, end, expenses, expenseHistory),
    );

    return {
      ...summary,
      label: `Semana ${4 - index}`,
      dateLabel: `${formatShortDate(start)} - ${formatShortDate(end)}`,
    };
  }).reverse();

  const dailyRows = Array.from({ length: 7 }, (_, index) => {
    const day = startOfDay(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - (6 - index),
      ),
    );
    const summary = summarizeSales(
      getSalesBetween(sales, day, endOfDay(day)),
      getSaleItemsBetween(saleItems, day, endOfDay(day)),
      calculateExpenseBreakdownBetween(day, endOfDay(day), expenses, expenseHistory),
    );

    return {
      ...summary,
      label: dayNames[day.getDay()],
      dateLabel: formatShortDate(day),
    };
  });

  const monthlyRows = monthNames.map((month, index) => {
    const start = new Date(currentYear, index, 1);
    const end = endOfDay(new Date(currentYear, index + 1, 0));
    const summary = summarizeSales(
      getSalesBetween(sales, start, end),
      getSaleItemsBetween(saleItems, start, end),
      calculateExpenseBreakdownBetween(start, end, expenses, expenseHistory),
    );

    return {
      ...summary,
      label: month,
      dateLabel: String(currentYear),
    };
  });

  const years = Array.from(
    new Set([
      currentYear,
      currentYear - 1,
      ...sales.map((sale) => new Date(sale.createdAt).getFullYear()),
    ]),
  ).sort((a, b) => a - b);

  const annualRows = years.map((year) => {
    const start = new Date(year, 0, 1);
    const end = endOfDay(new Date(year, 11, 31));
    const summary = summarizeSales(
      getSalesBetween(sales, start, end),
      getSaleItemsBetween(saleItems, start, end),
      calculateExpenseBreakdownBetween(start, end, expenses, expenseHistory),
    );

    return {
      ...summary,
      label: String(year),
    };
  });

  return (
    <div className="space-y-5">
      <DarkPanel>
        <div className="flex flex-wrap gap-2 p-4">
          {[
            { id: "diario", label: "Diario" },
            { id: "semanal", label: "Semanal" },
            { id: "mensual", label: "Mensual" },
            { id: "anual", label: "Anual" },
          ].map((tab) => (
            <button
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                activeHistoryView === tab.id
                  ? "border-cyan-300 bg-cyan-300 text-zinc-950"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
              )}
              key={tab.id}
              onClick={() =>
                setActiveHistoryView(
                  tab.id as "diario" | "semanal" | "mensual" | "anual",
                )
              }
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </DarkPanel>
      <div className="grid gap-5">
        {activeHistoryView === "diario" && (
          <HistoryTable
            icon={Lightbulb}
            rows={dailyRows}
            title="Ingresos diarios (ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âºltima semana)"
            totalLabel="Total semana"
          />
        )}
        {activeHistoryView === "semanal" && (
          <HistoryTable
            icon={CalendarClock}
            rows={weeklyRows}
            title="Ingresos semanales"
            totalLabel="Total 4 semanas"
          />
        )}
        {activeHistoryView === "mensual" && (
          <HistoryTable
            icon={CalendarClock}
            rows={monthlyRows}
            title="Ingresos mensuales"
            totalLabel="Total aÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â±o"
          />
        )}
        {activeHistoryView === "anual" && (
          <HistoryTable
            icon={WalletCards}
            rows={annualRows}
            title="Ingresos anuales"
            totalLabel="Total histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico"
          />
        )}
      </div>
    </div>
  );
}

function HistoryTable({
  icon,
  rows,
  title,
  totalLabel,
}: {
  icon: LucideIcon;
  rows: HistoryRow[];
  title: string;
  totalLabel: string;
}) {
  const totals = rows.reduce(
    (acc, row) => ({
      gross: acc.gross + row.gross,
      net: acc.net + row.net,
      items: acc.items + row.items,
    }),
    { gross: 0, net: 0, items: 0 },
  );

  return (
    <DarkPanel>
      <PanelHeader icon={icon} title={title} subtitle="Resumen histÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³rico" />
      <div className="overflow-x-auto p-4">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="text-xs uppercase text-zinc-500">
            <tr>
              <th className="pb-2 font-semibold">Periodo</th>
              <th className="pb-2 text-right font-semibold">Total ganÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â³</th>
              <th className="pb-2 text-right font-semibold">Neto gastos</th>
              <th className="pb-2 text-right font-semibold">Productos</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {rows.map((row) => (
              <tr key={`${row.label}-${row.dateLabel ?? ""}`}>
                <td className="py-2 pr-3">
                  <p className="font-semibold text-zinc-100">{row.label}</p>
                  {row.dateLabel && (
                    <p className="text-xs text-zinc-500">{row.dateLabel}</p>
                  )}
                </td>
                <td className="py-2 text-right text-cyan-100">
                  {formatCurrency(row.gross)}
                </td>
                <td
                  className={cn(
                    "py-2 text-right font-semibold",
                    row.net >= 0 ? "text-emerald-200" : "text-rose-200",
                  )}
                >
                  {formatCurrency(row.net)}
                </td>
                <td className="py-2 text-right text-zinc-100">{row.items}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-rose-500/80">
              <td className="pt-4 font-semibold text-zinc-100">{totalLabel}</td>
              <td className="pt-4 text-right font-semibold text-cyan-100">
                {formatCurrency(totals.gross)}
              </td>
              <td
                className={cn(
                  "pt-4 text-right font-semibold",
                  totals.net >= 0 ? "text-emerald-200" : "text-rose-200",
                )}
              >
                {formatCurrency(totals.net)}
              </td>
              <td className="pt-4 text-right font-semibold text-zinc-100">
                {totals.items}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </DarkPanel>
  );
}

function FinanzasView({
  expenses,
  fixedExpenses,
  grossRevenue,
  netProfit,
  saveExpenses,
  soldProductCost,
  totalExpenses,
  updateExpense,
}: {
  expenses: Expense[];
  fixedExpenses: number;
  grossRevenue: number;
  netProfit: number;
  saveExpenses: () => void;
  soldProductCost: number;
  totalExpenses: number;
  updateExpense: (key: string, value: number) => void;
}) {
  const fixedExpenseItems = expenses.filter((expense) => !isProductionExpense(expense));
  const ignoredProductionItems = expenses.filter((expense) => isProductionExpense(expense));

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <DarkPanel>
        <PanelHeader
          icon={WalletCards}
          title="Ganancia del local"
          subtitle="Ventas menos costo vendido y gastos fijos"
        />
        <div className="space-y-4 p-4">
          <FinanceLine
            icon={ArrowUpCircle}
            label="Total vendido"
            tone="cyan"
            value={grossRevenue}
          />
          <FinanceLine
            icon={ArrowDownCircle}
            label="Costo de productos vendidos"
            tone="amber"
            value={soldProductCost}
          />
          <FinanceLine
            icon={WalletCards}
            label="Gastos fijos"
            tone="amber"
            value={fixedExpenses}
          />
          <FinanceLine
            icon={DollarSign}
            label="Total descontado"
            tone="amber"
            value={soldProductCost + totalExpenses}
          />
          <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-5">
            <p className="text-sm text-emerald-100">Ganancia real final</p>
            <p className="mt-2 text-4xl font-semibold text-emerald-200">
              {formatCurrency(netProfit)}
            </p>
            <p className="mt-3 text-sm text-zinc-400">
              Formula: ventas - costo vendido - gastos fijos.
            </p>
          </div>
        </div>
      </DarkPanel>

      <DarkPanel>
        <PanelHeader
          icon={Lightbulb}
          title="Gastos que se descuentan"
          subtitle="Solo se descuentan gastos fijos del local"
        />
        <div className="space-y-5 p-4">
          {ignoredProductionItems.length > 0 && (
            <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-4">
              <p className="font-semibold text-amber-100">
                Los gastos de produccion manuales ya no se descuentan
              </p>
              <p className="mt-1 text-sm text-amber-50/80">
                Ahora la ganancia usa el costo del producto vendido para ser mas precisa.
              </p>
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
            <div>
              <p className="font-semibold text-zinc-100">Gastos fijos del local</p>
              <p className="mt-1 text-sm text-zinc-500">
                Sueldos, luz, agua, gas, alquiler y otros gastos generales.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {fixedExpenseItems.map((expense) => (
                <label
                  className="rounded-lg border border-white/10 bg-[#080a0c] p-4"
                  key={expense.key}
                >
                  <span className="text-sm font-semibold text-zinc-200">{expense.label}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{expense.category}</span>
                  <input
                    className="mt-3 h-11 w-full rounded-lg border border-white/10 bg-[#080a0c] px-3 text-sm text-zinc-100 outline-none focus:border-cyan-300/60"
                    min={0}
                    onChange={(event) =>
                      updateExpense(expense.key, Number(event.target.value || 0))
                    }
                    type="number"
                    value={expense.amount}
                  />
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 p-4">
          <Button
            className="h-11 bg-emerald-300 font-semibold text-zinc-950 hover:bg-emerald-200"
            onClick={saveExpenses}
            type="button"
          >
            Guardar gastos
          </Button>
        </div>
      </DarkPanel>
    </div>
  );
}
function EmpleadosView({
  attendance,
  registerAttendance,
  saveEmployee,
  staff,
}: {
  attendance: Attendance[];
  registerAttendance: (person: StaffMember, eventType: AttendanceEvent) => void;
  saveEmployee: (person: StaffForm) => Promise<boolean>;
  staff: StaffMember[];
}) {
  const emptyEmployee: StaffForm = {
    name: "",
    role: "",
    shift: "",
    area: "",
    status: "Activo",
  };
  const [newEmployee, setNewEmployee] = useState<StaffForm>(emptyEmployee);
  const [isCreatingEmployee, setIsCreatingEmployee] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<StaffForm>(emptyEmployee);
  const statusOptions: StaffMember["status"][] = [
    "Activo",
    "Pausa",
    "Ausente",
    "Franco",
  ];
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayRecords = attendance.filter(
    (record) => new Date(record.recordedAt) >= todayStart,
  );
  const activeCount = staff.filter((person) => person.status === "Activo").length;
  const pausedCount = staff.filter((person) => person.status === "Pausa").length;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={Users}
          label="Empleados cargados"
          tone="neutral"
          value={String(staff.length)}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Activos ahora"
          tone="green"
          value={String(activeCount)}
        />
        <MetricCard
          icon={TimerReset}
          label="En pausa"
          tone={pausedCount ? "amber" : "neutral"}
          value={String(pausedCount)}
        />
        <MetricCard
          icon={CalendarClock}
          label="Registros de hoy"
          tone={todayRecords.length ? "cyan" : "neutral"}
          value={String(todayRecords.length)}
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <DarkPanel>
        <PanelHeader
          icon={Users}
          title="Equipo"
          subtitle="Alta, edicion y registro de entrada y salida"
          right={
            <Button
              className="bg-cyan-300 font-semibold text-zinc-950 hover:bg-cyan-200"
              onClick={async () => {
                if (!isCreatingEmployee) {
                  setIsCreatingEmployee(true);
                  return;
                }

                const saved = await saveEmployee(newEmployee);
                if (saved) {
                  setNewEmployee(emptyEmployee);
                  setIsCreatingEmployee(false);
                }
              }}
              size="sm"
              type="button"
            >
              <Plus className="size-4" />
              {isCreatingEmployee ? "Guardar empleado" : "Agregar empleado"}
            </Button>
          }
        />
        {isCreatingEmployee && (
          <div className="border-b border-white/10 p-4">
            <div className="space-y-4 rounded-lg border border-white/10 bg-black/20 p-4">
              <div>
                <p className="font-semibold text-zinc-100">Nuevo empleado</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Carga los datos y despues guardalo para que aparezca en el equipo.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <InlineInput
                label="Nombre"
                onChange={(value) => setNewEmployee((current) => ({ ...current, name: value }))}
                value={newEmployee.name}
              />
              <InlineInput
                label="Rol"
                onChange={(value) => setNewEmployee((current) => ({ ...current, role: value }))}
                value={newEmployee.role}
              />
              <InlineInput
                label="Turno"
                onChange={(value) => setNewEmployee((current) => ({ ...current, shift: value }))}
                value={newEmployee.shift}
              />
              <InlineInput
                label="Sector"
                onChange={(value) => setNewEmployee((current) => ({ ...current, area: value }))}
                value={newEmployee.area}
              />
              <label className="text-xs font-semibold text-zinc-500">
                Estado
                <select
                  className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#080a0c] px-3 text-sm text-zinc-100 outline-none"
                  onChange={(event) =>
                    setNewEmployee((current) => ({
                      ...current,
                      status: event.target.value as StaffMember["status"],
                    }))
                  }
                  value={newEmployee.status}
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>
              </div>
              <div className="flex justify-end">
                <Button
                  className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                  onClick={() => {
                    setIsCreatingEmployee(false);
                    setNewEmployee(emptyEmployee);
                  }}
                  type="button"
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="grid gap-3 p-4">
          {staff.map((person) => (
            <div
              className="rounded-lg border border-white/10 bg-black/20 p-4"
              key={person.id ?? person.name}
            >
              {editingId === (person.id ?? person.name) ? (
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <InlineInput
                      label="Nombre"
                      onChange={(value) =>
                        setEditingEmployee((current) => ({ ...current, name: value }))
                      }
                      value={editingEmployee.name}
                    />
                    <InlineInput
                      label="Rol"
                      onChange={(value) =>
                        setEditingEmployee((current) => ({ ...current, role: value }))
                      }
                      value={editingEmployee.role}
                    />
                    <InlineInput
                      label="Turno"
                      onChange={(value) =>
                        setEditingEmployee((current) => ({ ...current, shift: value }))
                      }
                      value={editingEmployee.shift}
                    />
                    <InlineInput
                      label="Sector"
                      onChange={(value) =>
                        setEditingEmployee((current) => ({ ...current, area: value }))
                      }
                      value={editingEmployee.area}
                    />
                    <label className="text-xs font-semibold text-zinc-500">
                      Estado
                      <select
                        className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#080a0c] px-3 text-sm text-zinc-100 outline-none"
                        onChange={(event) =>
                          setEditingEmployee((current) => ({
                            ...current,
                            status: event.target.value as StaffMember["status"],
                          }))
                        }
                        value={editingEmployee.status}
                      >
                        {statusOptions.map((status) => (
                          <option key={status}>{status}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                      onClick={async () => {
                        const saved = await saveEmployee(editingEmployee);
                        if (saved) setEditingId(null);
                      }}
                      type="button"
                      variant="outline"
                    >
                      Guardar
                    </Button>
                    <Button
                      className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                      onClick={() => setEditingId(null)}
                      type="button"
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-lg font-semibold text-zinc-100">
                        {person.name}
                      </p>
                      <Badge className="border-cyan-300/20 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/10">
                        {person.role}
                      </Badge>
                      <Badge
                        className={cn(
                          person.status === "Activo"
                            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                            : person.status === "Pausa"
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                              : "border-white/10 bg-white/5 text-zinc-300",
                          "hover:bg-inherit",
                        )}
                      >
                        {person.status}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-sm text-zinc-500">
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                        {person.area}
                      </span>
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1">
                        {person.shift || "Sin turno"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                      onClick={() => {
                        setEditingId(person.id ?? person.name);
                        setEditingEmployee(person);
                      }}
                      type="button"
                      variant="outline"
                    >
                      Editar
                    </Button>
                    <Button
                      className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                      onClick={() => registerAttendance(person, "entrada")}
                      type="button"
                      variant="outline"
                    >
                      <ArrowUpCircle className="size-4" />
                      Entrada
                    </Button>
                    <Button
                      className="border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
                      onClick={() => registerAttendance(person, "salida")}
                      type="button"
                      variant="outline"
                    >
                      <ArrowDownCircle className="size-4" />
                      Salida
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </DarkPanel>

        <DarkPanel>
          <PanelHeader
            icon={CalendarClock}
            title="Registros"
            subtitle="Ultimas entradas y salidas"
          />
          <div className="space-y-3 p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase text-zinc-500">Hoy</p>
                <p className="mt-1 text-xl font-semibold text-zinc-100">
                  {todayRecords.length}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3">
                <p className="text-xs uppercase text-emerald-100">Entradas</p>
                <p className="mt-1 text-xl font-semibold text-emerald-200">
                  {todayRecords.filter((record) => record.eventType === "entrada").length}
                </p>
              </div>
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 p-3">
                <p className="text-xs uppercase text-amber-100">Salidas</p>
                <p className="mt-1 text-xl font-semibold text-amber-200">
                  {todayRecords.filter((record) => record.eventType === "salida").length}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {attendance.map((record) => (
                <div
                  className="flex items-start justify-between gap-3 rounded-lg border border-white/10 bg-black/20 p-4"
                  key={record.id}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "mt-0.5 size-2.5 rounded-full",
                          record.eventType === "entrada"
                            ? "bg-emerald-300"
                            : "bg-amber-300",
                        )}
                      />
                      <p className="truncate font-semibold text-zinc-100">
                        {record.employeeName}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      <Badge
                        className={cn(
                          record.eventType === "entrada"
                            ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100"
                            : "border-amber-300/20 bg-amber-300/10 text-amber-100",
                          "hover:bg-inherit",
                        )}
                      >
                        {record.eventType === "entrada" ? "Entrada" : "Salida"}
                      </Badge>
                      <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
                        Turno {record.shift}
                      </Badge>
                    </div>
                  </div>
                  <p className="shrink-0 text-right text-sm text-zinc-400">
                    {formatFullDateTime(record.recordedAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </DarkPanel>
      </div>
    </div>
  );
}

function StockView({
  closeFlavorBatch,
  deleteFlavor,
  deleteProduct,
  flavors,
  flavorBatches,
  flavorUnitsInStock,
  loadFlavorBatch,
  lowStock,
  lowFlavorStock,
  products,
  saveProduct,
  saveFlavor,
  unitsInStock,
}: {
  closeFlavorBatch: (batch: FlavorBatch, currentStock: number) => Promise<boolean>;
  deleteFlavor: (flavor: IceCreamFlavor) => void;
  deleteProduct: (product: Product) => void;
  flavors: IceCreamFlavor[];
  flavorBatches: FlavorBatch[];
  flavorUnitsInStock: number;
  loadFlavorBatch: (
    flavor: IceCreamFlavor,
    kilos: number,
    portionsLoaded: number,
  ) => Promise<boolean>;
  lowStock: Product[];
  lowFlavorStock: IceCreamFlavor[];
  products: Product[];
  saveProduct: (product: ProductForm, previousStock?: number) => Promise<boolean>;
  saveFlavor: (flavor: FlavorForm) => Promise<boolean>;
  unitsInStock: number;
}) {
  const emptyProduct: ProductForm = {
    id: "",
    name: "",
    category: "",
    price: 0,
    cost: 0,
    stock: 0,
    minStock: 0,
    unit: "unid.",
    imageUrl: "",
    maxFlavors: 0,
    flavorUsage: 0,
  };
  const [newProduct, setNewProduct] = useState<ProductForm>(emptyProduct);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<ProductForm>(emptyProduct);
  const [editingFlavorId, setEditingFlavorId] = useState<string | null>(null);
  const [editingFlavor, setEditingFlavor] = useState<FlavorForm | null>(null);
  const [batchFlavorId, setBatchFlavorId] = useState<string | null>(null);
  const [batchKilos, setBatchKilos] = useState("20");
  const [batchPortions, setBatchPortions] = useState("160");
  const emptyFlavor: FlavorForm = {
    id: "",
    name: "",
    category: "Crema",
    available: true,
    color: "#67e8f9",
    stock: 0,
    minStock: 0,
    unit: "porciones",
  };
  const [newFlavor, setNewFlavor] = useState<FlavorForm>(emptyFlavor);
  const [isCreatingFlavor, setIsCreatingFlavor] = useState(false);
  const [stockTab, setStockTab] = useState<"productos" | "gustos">("productos");
  const [productQuery, setProductQuery] = useState("");
  const [productCategory, setProductCategory] = useState("Todos");
  const [flavorQuery, setFlavorQuery] = useState("");
  const [showOnlyLowProducts, setShowOnlyLowProducts] = useState(false);
  const [showOnlyLowFlavors, setShowOnlyLowFlavors] = useState(false);
  const activeBatchesByFlavor = new Map(
    flavorBatches
      .filter((batch) => batch.status === "activa")
      .map((batch) => [batch.flavorId, batch] as const),
  );
  const latestClosedBatchByFlavor = flavorBatches.reduce((map, batch) => {
    if (batch.status === "cerrada" && !map.has(batch.flavorId)) {
      map.set(batch.flavorId, batch);
    }
    return map;
  }, new Map<string, FlavorBatch>());
  const productCategories = [
    "Todos",
    ...new Set(products.map((product) => product.category).sort()),
  ];
  const filteredProducts = products
    .filter((product) => {
      const matchesCategory =
        productCategory === "Todos" || product.category === productCategory;
      const normalizedQuery = productQuery.trim().toLowerCase();
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        product.category.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    })
    .sort((left, right) => {
      const leftLow = left.stock <= left.minStock ? 0 : 1;
      const rightLow = right.stock <= right.minStock ? 0 : 1;
      if (leftLow !== rightLow) return leftLow - rightLow;
      return left.name.localeCompare(right.name);
    });
  const visibleProducts = showOnlyLowProducts
    ? filteredProducts.filter((product) => product.stock <= product.minStock)
    : filteredProducts;
  const filteredFlavors = flavors
    .filter((flavor) => {
      const normalizedQuery = flavorQuery.trim().toLowerCase();
      return (
        !normalizedQuery ||
        flavor.name.toLowerCase().includes(normalizedQuery) ||
        flavor.category.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((left, right) => {
      const leftLow = left.stock <= left.minStock ? 0 : 1;
      const rightLow = right.stock <= right.minStock ? 0 : 1;
      if (leftLow !== rightLow) return leftLow - rightLow;
      return left.name.localeCompare(right.name);
    });
  const visibleFlavors = showOnlyLowFlavors
    ? filteredFlavors.filter((flavor) => flavor.stock <= flavor.minStock)
    : filteredFlavors;
  const flavorGroups = groupFlavorsByCategory(visibleFlavors);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          icon={Package}
          label="Productos activos"
          tone="neutral"
          value={String(products.length)}
        />
        <MetricCard
          icon={TimerReset}
          label="Alertas de stock"
          tone={lowStock.length ? "amber" : "green"}
          value={String(lowStock.length)}
        />
        <MetricCard
          icon={Store}
          label="Unidades disponibles"
          tone="cyan"
          value={String(unitsInStock)}
        />
        <MetricCard
          icon={Snowflake}
          label="Stock de gustos"
          tone={lowFlavorStock.length ? "amber" : "green"}
          value={String(flavorUnitsInStock)}
        />
      </div>

      {(lowStock.length > 0 || lowFlavorStock.length > 0) && (
        <DarkPanel>
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="font-semibold text-zinc-100">Alertas rapidas de stock</p>
                <p className="mt-1 text-sm text-zinc-500">
                  Marca enseguida lo que esta en o por debajo del minimo.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  className="border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
                  onClick={() => {
                    setStockTab("productos");
                    setShowOnlyLowProducts(true);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {lowStock.length} productos bajos
                </Button>
                <Button
                  className="border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
                  onClick={() => {
                    setStockTab("gustos");
                    setShowOnlyLowFlavors(true);
                  }}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  {lowFlavorStock.length} gustos bajos
                </Button>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-zinc-100">Productos a reponer</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lowStock.slice(0, 8).map((product) => (
                    <Badge
                      className="border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/10"
                      key={product.id}
                    >
                      {product.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/20 p-4">
                <p className="text-sm font-semibold text-zinc-100">Gustos a reponer</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lowFlavorStock.slice(0, 8).map((flavor) => (
                    <Badge
                      className="border-amber-300/20 bg-amber-300/10 text-amber-100 hover:bg-amber-300/10"
                      key={flavor.id}
                    >
                      {flavor.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DarkPanel>
      )}

      <DarkPanel>
        <div className="flex flex-wrap gap-2 p-4">
          {[
            { id: "productos", label: "Productos" },
            { id: "gustos", label: "Gustos" },
          ].map((tab) => (
            <button
              className={cn(
                "rounded-lg border px-4 py-2 text-sm font-semibold transition",
                stockTab === tab.id
                  ? "border-cyan-300 bg-cyan-300 text-zinc-950"
                  : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
              )}
              key={tab.id}
              onClick={() => setStockTab(tab.id as "productos" | "gustos")}
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      </DarkPanel>

      {stockTab === "gustos" && (
        <DarkPanel>
          <PanelHeader
            icon={Snowflake}
            title="Gustos"
            subtitle="Cada venta de helado descuenta los gustos elegidos"
            right={
              <Button
                className="bg-cyan-300 font-semibold text-zinc-950 hover:bg-cyan-200"
                onClick={() => {
                  setIsCreatingFlavor(true);
                  setEditingFlavorId(null);
                  setEditingFlavor(null);
                }}
                size="sm"
                type="button"
              >
                <Plus className="size-4" />
                Agregar gusto
              </Button>
            }
          />
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <input
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60"
                  onChange={(event) => setFlavorQuery(event.target.value)}
                  placeholder="Buscar gusto"
                  value={flavorQuery}
                />
              </div>
              <Button
                className={cn(
                  "font-semibold hover:bg-amber-300/20",
                  showOnlyLowFlavors
                    ? "border-amber-300 bg-amber-300 text-zinc-950"
                    : "border-amber-300/30 bg-amber-300/10 text-amber-100",
                )}
                onClick={() => setShowOnlyLowFlavors((current) => !current)}
                size="sm"
                type="button"
                variant="outline"
              >
                <TimerReset className="size-4" />
                {showOnlyLowFlavors ? "Ver todos" : "Solo bajo stock"}
              </Button>
            </div>

            {lowFlavorStock.length > 0 && (
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3">
                <p className="font-semibold text-amber-100">
                  {lowFlavorStock.length} gusto{lowFlavorStock.length === 1 ? "" : "s"} para reponer
                </p>
                <p className="mt-1 text-sm text-amber-50/80">
                  Usa este filtro para ver rapido los sabores que estan bajos.
                </p>
              </div>
            )}

            {isCreatingFlavor && (
              <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                  <InlineInput
                    label="Nombre"
                    onChange={(value) =>
                      setNewFlavor((current) => ({ ...current, name: value }))
                    }
                    value={newFlavor.name}
                  />
                  <InlineInput
                    label="Categoria"
                    onChange={(value) =>
                      setNewFlavor((current) => ({ ...current, category: value }))
                    }
                    value={newFlavor.category}
                  />
                  <InlineInput
                    label="Stock"
                    onChange={(value) =>
                      setNewFlavor((current) => ({
                        ...current,
                        stock: Number(value || 0),
                      }))
                    }
                    type="number"
                    value={String(newFlavor.stock)}
                  />
                  <InlineInput
                    label="Minimo"
                    onChange={(value) =>
                      setNewFlavor((current) => ({
                        ...current,
                        minStock: Number(value || 0),
                      }))
                    }
                    type="number"
                    value={String(newFlavor.minStock)}
                  />
                  <InlineInput
                    label="Unidad"
                    onChange={(value) =>
                      setNewFlavor((current) => ({ ...current, unit: value }))
                    }
                    value={newFlavor.unit}
                  />
                  <label className="text-xs font-semibold text-zinc-500">
                    Color
                    <input
                      className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#080a0c] px-2 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/60"
                      onChange={(event) =>
                        setNewFlavor((current) => ({
                          ...current,
                          color: event.target.value,
                        }))
                      }
                      type="color"
                      value={newFlavor.color}
                    />
                  </label>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                    onClick={async () => {
                      const saved = await saveFlavor(newFlavor);
                      if (saved) {
                        setNewFlavor(emptyFlavor);
                        setIsCreatingFlavor(false);
                      }
                    }}
                    type="button"
                    variant="outline"
                  >
                    Guardar
                  </Button>
                  <Button
                    className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                    onClick={() => {
                      setIsCreatingFlavor(false);
                      setNewFlavor(emptyFlavor);
                    }}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-5">
              {flavorGroups.map((group) => (
                <div className="space-y-3" key={group.category}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-100">{group.category}</p>
                      <p className="text-sm text-zinc-500">
                        {group.items.length} gusto{group.items.length === 1 ? "" : "s"}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {group.items.map((flavor) => {
                const isLow = flavor.stock <= flavor.minStock;
                const isEditing = editingFlavorId === flavor.id && editingFlavor;
                const activeBatch = activeBatchesByFlavor.get(flavor.id);
                const latestClosedBatch = latestClosedBatchByFlavor.get(flavor.id);
                const isLoadingBatch = batchFlavorId === flavor.id;

                return (
                  <DarkPanel className="overflow-hidden" key={flavor.id}>
                    <div className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span
                              className="size-3 rounded-full border border-black/10"
                              style={{ backgroundColor: flavor.color }}
                            />
                            <p className="truncate font-semibold text-zinc-100">
                              {flavor.name}
                            </p>
                            <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
                              {flavor.category}
                            </Badge>
                          </div>
                          {activeBatch ? (
                            <p className="mt-1 text-xs text-cyan-200">
                              Tanda activa: {activeBatch.kilos} kg / {activeBatch.portionsLoaded} porciones
                            </p>
                          ) : latestClosedBatch?.suggestedYield ? (
                            <p className="mt-1 text-xs text-zinc-500">
                              Sugerencia: {Math.round(latestClosedBatch.suggestedYield)} porciones
                            </p>
                          ) : null}
                        </div>
                        <Badge
                          className={cn(
                            isLow
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                              : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
                            "hover:bg-inherit",
                          )}
                        >
                          {isLow ? "Reponer" : "Disponible"}
                        </Badge>
                      </div>

                      {isEditing ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                          <InlineInput
                            label="Gusto"
                            onChange={(value) =>
                              setEditingFlavor((current) =>
                                current ? { ...current, name: value } : current,
                              )
                            }
                            value={editingFlavor.name}
                          />
                          <InlineInput
                            label="Categoria"
                            onChange={(value) =>
                              setEditingFlavor((current) =>
                                current ? { ...current, category: value } : current,
                              )
                            }
                            value={editingFlavor.category}
                          />
                          <InlineInput
                            label="Stock"
                            onChange={(value) =>
                              setEditingFlavor((current) =>
                                current ? { ...current, stock: Number(value || 0) } : current,
                              )
                            }
                            type="number"
                            value={String(editingFlavor.stock)}
                          />
                          <InlineInput
                            label="Minimo"
                            onChange={(value) =>
                              setEditingFlavor((current) =>
                                current ? { ...current, minStock: Number(value || 0) } : current,
                              )
                            }
                            type="number"
                            value={String(editingFlavor.minStock)}
                          />
                          <InlineInput
                            label="Unidad"
                            onChange={(value) =>
                              setEditingFlavor((current) =>
                                current ? { ...current, unit: value } : current,
                              )
                            }
                            value={editingFlavor.unit}
                          />
                        </div>
                      ) : (
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                            <p className="text-xs uppercase text-zinc-500">Stock</p>
                            <p className="mt-1 font-semibold text-zinc-100">
                              {flavor.stock} {flavor.unit}
                            </p>
                          </div>
                          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                            <p className="text-xs uppercase text-zinc-500">Minimo</p>
                            <p className="mt-1 font-semibold text-zinc-100">
                              {flavor.minStock} {flavor.unit}
                            </p>
                          </div>
                          <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                            <p className="text-xs uppercase text-zinc-500">Unidad</p>
                            <p className="mt-1 font-semibold text-zinc-100">{flavor.unit}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                              onClick={async () => {
                                const saved = await saveFlavor(editingFlavor);
                                if (saved) {
                                  setEditingFlavorId(null);
                                  setEditingFlavor(null);
                                }
                              }}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Guardar
                            </Button>
                            <Button
                              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                              onClick={() => {
                                setEditingFlavorId(null);
                                setEditingFlavor(null);
                              }}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                              onClick={() => {
                                setEditingFlavorId(flavor.id);
                                setEditingFlavor(flavor);
                              }}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Editar
                            </Button>
                            <Button
                              className="border-rose-300/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/20"
                              onClick={() => deleteFlavor(flavor)}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <Trash2 className="size-4" />
                              Eliminar
                            </Button>
                            {activeBatch ? (
                              <Button
                                className="border-amber-300/30 bg-amber-300/10 text-amber-100 hover:bg-amber-300/20"
                                onClick={async () => {
                                  await closeFlavorBatch(activeBatch, flavor.stock);
                                }}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                Se termino
                              </Button>
                            ) : (
                              <Button
                                className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                                onClick={() => {
                                  setBatchFlavorId((current) =>
                                    current === flavor.id ? null : flavor.id,
                                  );
                                  setBatchKilos("20");
                                  setBatchPortions(
                                    latestClosedBatch?.suggestedYield
                                      ? String(Math.round(latestClosedBatch.suggestedYield))
                                      : "160",
                                  );
                                }}
                                size="sm"
                                type="button"
                                variant="outline"
                              >
                                Cargar balde
                              </Button>
                            )}
                          </>
                        )}
                      </div>

                      {isLoadingBatch && !activeBatch && (
                        <div className="grid gap-3 rounded-lg border border-white/10 bg-black/20 p-3 md:grid-cols-[1fr_1fr_auto_auto]">
                          <InlineInput
                            label="Kilos del balde"
                            onChange={setBatchKilos}
                            type="number"
                            value={batchKilos}
                          />
                          <InlineInput
                            label="Porciones estimadas"
                            onChange={setBatchPortions}
                            type="number"
                            value={batchPortions}
                          />
                          <Button
                            className="self-end bg-cyan-300 font-semibold text-zinc-950 hover:bg-cyan-200"
                            onClick={async () => {
                              const saved = await loadFlavorBatch(
                                flavor,
                                Number(batchKilos || 0),
                                Number(batchPortions || 0),
                              );
                              if (saved) {
                                setBatchFlavorId(null);
                                setBatchKilos("20");
                                setBatchPortions("160");
                              }
                            }}
                            type="button"
                          >
                            Guardar tanda
                          </Button>
                          <Button
                            className="self-end border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                            onClick={() => setBatchFlavorId(null)}
                            type="button"
                            variant="outline"
                          >
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </DarkPanel>
                );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DarkPanel>
      )}

      {stockTab === "productos" && (
        <DarkPanel>
          <PanelHeader
            icon={Package}
            title="Productos"
            subtitle="Alta, edicion y control de stock"
            right={
              <Button
                className="bg-cyan-300 font-semibold text-zinc-950 hover:bg-cyan-200"
                onClick={() => {
                  setIsCreatingProduct(true);
                  setEditingId(null);
                }}
                size="sm"
                type="button"
              >
                <Plus className="size-4" />
                Agregar producto
              </Button>
            }
          />
          <div className="space-y-4 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500" />
                <input
                  className="h-11 w-full rounded-lg border border-white/10 bg-black/30 pl-10 pr-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/60"
                  onChange={(event) => setProductQuery(event.target.value)}
                  placeholder="Buscar producto"
                  value={productQuery}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {productCategories.map((item) => (
                  <button
                    className={cn(
                      "rounded-lg border px-3 py-2 text-sm font-semibold transition",
                      productCategory === item
                        ? "border-cyan-300 bg-cyan-300 text-zinc-950"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10",
                    )}
                    key={item}
                    onClick={() => setProductCategory(item)}
                    type="button"
                  >
                    {item}
                  </button>
                ))}
                <Button
                  className={cn(
                    "font-semibold hover:bg-amber-300/20",
                    showOnlyLowProducts
                      ? "border-amber-300 bg-amber-300 text-zinc-950"
                      : "border-amber-300/30 bg-amber-300/10 text-amber-100",
                  )}
                  onClick={() => setShowOnlyLowProducts((current) => !current)}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <TimerReset className="size-4" />
                  {showOnlyLowProducts ? "Ver todos" : "Solo bajo stock"}
                </Button>
              </div>
            </div>

            {lowStock.length > 0 && (
              <div className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-4 py-3">
                <p className="font-semibold text-amber-100">
                  {lowStock.length} producto{lowStock.length === 1 ? "" : "s"} para reponer
                </p>
                <p className="mt-1 text-sm text-amber-50/80">
                  Estan en o por debajo del minimo configurado.
                </p>
              </div>
            )}

            {isCreatingProduct && (
              <div className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
                <ProductFields product={newProduct} setProduct={setNewProduct} />
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                    onClick={async () => {
                      const saved = await saveProduct(newProduct);
                      if (saved) {
                        setNewProduct(emptyProduct);
                        setIsCreatingProduct(false);
                      }
                    }}
                    type="button"
                    variant="outline"
                  >
                    Guardar
                  </Button>
                  <Button
                    className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                    onClick={() => {
                      setIsCreatingProduct(false);
                      setNewProduct(emptyProduct);
                    }}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            <div className="grid gap-3 xl:grid-cols-2">
              {visibleProducts.map((product) => {
                const isLow = product.stock <= product.minStock;
                const isEditing = editingId === product.id;

                return (
                  <DarkPanel className="overflow-hidden" key={product.id}>
                    <div className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-zinc-100">
                              {product.name}
                            </p>
                            <Badge className="border-white/10 bg-white/5 text-zinc-300 hover:bg-white/5">
                              {product.category}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm text-zinc-500">
                            {formatCurrency(product.price)}
                          </p>
                        </div>
                        <Badge
                          className={cn(
                            isLow
                              ? "border-amber-300/20 bg-amber-300/10 text-amber-100"
                              : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100",
                            "hover:bg-inherit",
                          )}
                        >
                          {isLow ? "Reponer" : "Disponible"}
                        </Badge>
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <ProductFields
                            product={editingProduct}
                            setProduct={setEditingProduct}
                          />
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="border-emerald-300/30 bg-emerald-300/10 text-emerald-100 hover:bg-emerald-300/20"
                              onClick={async () => {
                                const saved = await saveProduct(
                                  editingProduct,
                                  product.stock,
                                );
                                if (saved) setEditingId(null);
                              }}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Guardar
                            </Button>
                            <Button
                              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                              onClick={() => setEditingId(null)}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Cancelar
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                              <p className="text-xs uppercase text-zinc-500">Stock</p>
                              <p className="mt-1 font-semibold text-zinc-100">
                                {product.stock} {product.unit}
                              </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                              <p className="text-xs uppercase text-zinc-500">Minimo</p>
                              <p className="mt-1 font-semibold text-zinc-100">
                                {product.minStock} {product.unit}
                              </p>
                            </div>
                            <div className="rounded-lg border border-white/10 bg-black/20 p-3">
                              <p className="text-xs uppercase text-zinc-500">Costo</p>
                              <p className="mt-1 font-semibold text-zinc-100">
                                {formatCurrency(product.cost)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="border-cyan-300/30 bg-cyan-300/10 text-cyan-100 hover:bg-cyan-300/20"
                              onClick={() => {
                                setEditingId(product.id);
                                setEditingProduct(product);
                              }}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              Editar
                            </Button>
                            <Button
                              className="border-rose-300/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/20"
                              onClick={() => deleteProduct(product)}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              <Trash2 className="size-4" />
                              Eliminar
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </DarkPanel>
                );
              })}
            </div>
          </div>
        </DarkPanel>
      )}
    </div>
  );
}

function ProductFields({
  product,
  setProduct,
}: {
  product: ProductForm;
  setProduct: React.Dispatch<React.SetStateAction<ProductForm>>;
}) {
  return (
    <div className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-2 xl:grid-cols-5">
      <InlineInput
        label="Nombre"
        onChange={(value) => setProduct((current) => ({ ...current, name: value }))}
        value={product.name}
      />
      <InlineInput
        label="Rubro"
        onChange={(value) =>
          setProduct((current) => ({ ...current, category: value }))
        }
        value={product.category}
      />
      <InlineInput
        label="Precio"
        onChange={(value) =>
          setProduct((current) => ({ ...current, price: Number(value || 0) }))
        }
        type="number"
        value={String(product.price)}
      />
      <InlineInput
        label="Costo"
        onChange={(value) =>
          setProduct((current) => ({ ...current, cost: Number(value || 0) }))
        }
        type="number"
        value={String(product.cost)}
      />
      <InlineInput
        label="Stock"
        onChange={(value) =>
          setProduct((current) => ({ ...current, stock: Number(value || 0) }))
        }
        type="number"
        value={String(product.stock)}
      />
      <InlineInput
        label="Minimo"
        onChange={(value) =>
          setProduct((current) => ({ ...current, minStock: Number(value || 0) }))
        }
        type="number"
        value={String(product.minStock)}
      />
      <InlineInput
        label="Unidad"
        onChange={(value) => setProduct((current) => ({ ...current, unit: value }))}
        value={product.unit}
      />
      <InlineInput
        label="Max gustos"
        onChange={(value) =>
          setProduct((current) => ({
            ...current,
            maxFlavors: Number(value || 0),
          }))
        }
        type="number"
        value={String(product.maxFlavors)}
      />
      <InlineInput
        label="Porciones estimadas"
        onChange={(value) =>
          setProduct((current) => ({
            ...current,
            flavorUsage: Number(value || 0),
          }))
        }
        type="number"
        value={String(product.flavorUsage)}
      />
      <InlineInput
        label="Imagen URL"
        onChange={(value) =>
          setProduct((current) => ({ ...current, imageUrl: value }))
        }
        value={product.imageUrl}
      />
    </div>
  );
}

function InlineInput({
  label,
  onChange,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  type?: "text" | "number";
  value: string;
}) {
  return (
    <label className="text-xs font-semibold text-zinc-500">
      {label}
      <input
        className="mt-1 h-10 w-full rounded-lg border border-white/10 bg-[#080a0c] px-3 text-sm text-zinc-100 outline-none transition focus:border-cyan-300/60"
        min={type === "number" ? 0 : undefined}
        onChange={(event) => onChange(event.target.value)}
        type={type}
        value={value}
      />
    </label>
  );
}

function DeleteConfirmModal({
  confirmLabel,
  description,
  isLoading,
  isOpen,
  onCancel,
  onConfirm,
  title,
}: {
  confirmLabel: string;
  description: string;
  isLoading: boolean;
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-[#101315] shadow-2xl">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-rose-300/20 bg-rose-300/10 text-rose-100">
              <Trash2 className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-400">{description}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-end gap-2 p-4">
          <Button
            className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
            disabled={isLoading}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            Cancelar
          </Button>
          <Button
            className="border-rose-300/30 bg-rose-300/10 text-rose-100 hover:bg-rose-300/20"
            disabled={isLoading}
            onClick={onConfirm}
            type="button"
            variant="outline"
          >
            {isLoading ? "Eliminando..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

function HelpModal({
  help,
  isOpen,
  onClose,
}: {
  help: { title: string; summary: string; sections: HelpSection[] };
  isOpen: boolean;
  onClose: () => void;
}) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setExpandedSection(null);
    }
  }, [isOpen, help.title]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-3xl overflow-hidden rounded-lg border border-white/10 bg-[#101315] shadow-2xl">
        <PanelHeader
          icon={CircleHelp}
          right={
            <Button
              className="border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
              onClick={onClose}
              size="sm"
              type="button"
              variant="outline"
            >
              Cerrar
            </Button>
          }
          subtitle={help.summary}
          title={help.title}
        />
        <div className="grid gap-3 p-4 md:grid-cols-2">
          {help.sections.map((section, index) => {
            const sectionKey = `${help.title}-${section.title}`;
            const isExpanded = expandedSection === sectionKey;

            return (
            <button
              className={cn(
                "rounded-lg border bg-black/20 p-4 text-left transition",
                isExpanded
                  ? "border-cyan-300/40 bg-cyan-300/5"
                  : "border-white/10 hover:bg-white/[0.03]",
              )}
              key={sectionKey}
              onClick={() =>
                setExpandedSection((current) =>
                  current === sectionKey ? null : sectionKey,
                )
              }
              type="button"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-100">{section.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {section.description}
                  </p>
                  {isExpanded && (
                    <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
                      {section.details.map((detail, detailIndex) => (
                        <div className="flex items-start gap-3" key={`${sectionKey}-${detailIndex}`}>
                          <span className="mt-1 size-1.5 shrink-0 rounded-full bg-cyan-300" />
                          <p className="text-sm leading-6 text-zinc-300">{detail}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-cyan-100">
                  {isExpanded ? <Minus className="size-4" /> : <Plus className="size-4" />}
                </div>
              </div>
            </button>
          )})}
        </div>
      </div>
    </div>
  );
}

function DarkPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-white/10 bg-[#0f1213] shadow-2xl", className)}>
      {children}
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  right,
  subtitle,
  title,
}: {
  icon: LucideIcon;
  right?: React.ReactNode;
  subtitle: string;
  title: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-white/5 text-cyan-200">
          <Icon className="size-5" />
        </div>
        <div>
          <h2 className="font-semibold text-zinc-100">{title}</h2>
          {subtitle && <p className="text-sm text-zinc-500">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "cyan" | "amber" | "green" | "red" | "neutral";
  value: string;
}) {
  const toneClass = {
    cyan: "text-cyan-200 bg-cyan-300/10 border-cyan-300/20",
    amber: "text-amber-200 bg-amber-300/10 border-amber-300/20",
    green: "text-emerald-200 bg-emerald-300/10 border-emerald-300/20",
    red: "text-rose-200 bg-rose-300/10 border-rose-300/20",
    neutral: "text-zinc-200 bg-white/5 border-white/10",
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#0f1213] p-4 shadow-2xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-normal text-zinc-100">
            {value}
          </p>
        </div>
        <div className={cn("flex size-10 items-center justify-center rounded-lg border", toneClass[tone])}>
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function ShiftCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/20 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">Gana por la {label.toLowerCase()}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-100">
            {formatCurrency(value)}
          </p>
        </div>
        <div className="flex size-11 items-center justify-center rounded-lg bg-cyan-300/10 text-cyan-200">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function FinanceLine({
  icon: Icon,
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone: "cyan" | "amber";
  value: number;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border p-4",
        tone === "cyan"
          ? "border-cyan-300/20 bg-cyan-300/10"
          : "border-amber-300/20 bg-amber-300/10",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-black/20">
          <Icon className={cn("size-5", tone === "cyan" ? "text-cyan-200" : "text-amber-200")} />
        </div>
        <p className="font-semibold text-zinc-100">{label}</p>
      </div>
      <p className="text-xl font-semibold text-zinc-100">{formatCurrency(value)}</p>
    </div>
  );
}

function IconButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className="flex size-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 transition hover:bg-white/10"
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function TotalRow({
  label,
  strong,
  value,
}: {
  label: string;
  strong?: boolean;
  value: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-1 text-sm",
        strong && "text-base font-semibold",
      )}
    >
      <span className="text-zinc-500">{label}</span>
      <span className={strong ? "text-zinc-100" : "text-zinc-300"}>{value}</span>
    </div>
  );
}
