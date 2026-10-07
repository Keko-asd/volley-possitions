import type { Point, ResponsibilityZone, Scheme } from '@/types/volleyball'

// Приём втроём (Д1, Д2, либеро), защита «6 сзади».
// Координаты в метрах: x 0…9 слева направо, y 0…9 от сетки к лицевой линии.
// Игрок, указанный в bench, стоит за боковой линией в зоне замены.
// Позиции и зоны ответственности требуют проверки тренером.

// Зоны ответственности. Зона игрока состоит из нескольких участков, у каждого своя подсказка.
// Один набор участков переиспользуется во всех выходах, где игрок занимает это место.
const ZONES = {
  // Приём «полосой»: один принимающий берёт узкую полосу вдоль боковой во всю глубину
  // и отдаёт стык соседу, остальные делят оставшуюся глубину, передняя линия берёт короткие.
  // Полоса у левой боковой
  stripLeft: [
    {
      x: 0,
      y: 0,
      width: 2.5,
      height: 9,
      reason:
        'Полоса у левой боковой во всю глубину. Стык с соседом игрок не берёт: так он меньше перемещается на приёме и успевает уйти на разбег.',
    },
  ],
  stripLeftSeam: [
    {
      x: 2.5,
      y: 3.5,
      width: 3,
      height: 5.5,
      reason:
        'Центр приёма. Игрок забирает стык с принимающим у левой боковой, чтобы тому было проще уйти в атаку.',
    },
  ],
  stripLeftFar: [
    {
      x: 5.5,
      y: 3.5,
      width: 3.5,
      height: 5.5,
      reason:
        'Правая часть приёма. Игрок принимает подачи в зону 1 и к правой боковой, стык слева забирает сосед.',
    },
  ],
  stripLeftShortCenter: [
    {
      x: 2.5,
      y: 0,
      width: 3,
      height: 3.5,
      reason:
        'Короткие мячи в центре, перед принимающими. Игрок подстраховывает приём и прикрывает связующего.',
    },
  ],
  stripLeftShortSide: [
    {
      x: 5.5,
      y: 0,
      width: 3.5,
      height: 3.5,
      reason:
        'Короткие мячи у правой боковой. Игрок помогает принимающему позади, если подача падает у сетки.',
    },
  ],
  // Полоса у правой боковой
  stripRight: [
    {
      x: 6.5,
      y: 0,
      width: 2.5,
      height: 9,
      reason:
        'Полоса у правой боковой во всю глубину. Стык с соседом игрок не берёт: так он меньше перемещается на приёме и успевает уйти на разбег.',
    },
  ],
  stripRightSeam: [
    {
      x: 3.5,
      y: 3.5,
      width: 3,
      height: 5.5,
      reason:
        'Центр приёма. Игрок забирает стык с принимающим у правой боковой, чтобы тому было проще уйти в атаку.',
    },
  ],
  stripRightFar: [
    {
      x: 0,
      y: 3.5,
      width: 3.5,
      height: 5.5,
      reason:
        'Левая часть приёма. Игрок принимает подачи в зону 5 и к левой боковой, стык справа забирает сосед.',
    },
  ],
  stripRightShortCenter: [
    {
      x: 3.5,
      y: 0,
      width: 3,
      height: 3.5,
      reason:
        'Короткие мячи в центре, перед принимающими. Игрок подстраховывает приём и прикрывает связующего.',
    },
  ],
  stripRightShortSide: [
    {
      x: 0,
      y: 0,
      width: 3.5,
      height: 3.5,
      reason:
        'Короткие мячи у левой боковой. Игрок помогает принимающему позади, если подача падает у сетки.',
    },
  ],
} satisfies Record<string, ResponsibilityZone[]>

// Куда нападающие разбегаются на удар. Передняя линия бьёт у сетки,
// задняя — из-за линии атаки: диагональный из зоны 1, доигровщик из зоны 6 («пайп»).
const ATTACK_POINTS = {
  zone4: { x: 1.2, y: 0.45 },
  zone3: { x: 4.5, y: 0.45 },
  zone2: { x: 7.8, y: 0.45 },
  backRight: { x: 7.5, y: 3.4 },
  pipe: { x: 4.5, y: 3.4 },
} satisfies Record<string, Point>

// Атака и защита расписаны отдельно для розыгрыша с нашей подачи и с приёма,
// если начало розыгрыша на них влияет; иначе — одна расстановка, и переключатель выключен.
// За площадкой обычно центральный задней линии, вместо него играет либеро.
// Если центральный задней линии подаёт (выходы 2 и 5), в розыгрыше с подачи он остаётся на площадке.
export const receiveThreeSixBack: Scheme = {
  id: 'receive-three-six-back',
  name: 'Приём втроём, защита «6 сзади»',
  layouts: {
    // Выход 1: связующий в зоне 1
    1: {
      // расстановка по протоколу
      base: {
        bench: 'L',
        positions: {
          S: { x: 7.56, y: 6.3 },
          OH1: { x: 7.56, y: 1.98 },
          MB1: { x: 4.5, y: 1.98 },
          OPP: { x: 1.44, y: 1.98 },
          OH2: { x: 1.44, y: 6.3 },
          MB2: { x: 4.5, y: 6.3 },
          L: { x: -0.8, y: 4.14 },
        },
      },
      // приём подачи соперника
      receive: {
        bench: 'MB2',
        positions: {
          S: { x: 7.92, y: 6.38 },
          OH1: { x: 7.02, y: 6.22 },
          MB1: { x: 3.5, y: 3.5 },
          OPP: { x: 1.26, y: 4.0 },
          OH2: { x: 1.8, y: 7.0 },
          MB2: { x: -0.8, y: 4.14 },
          L: { x: 4.5, y: 7.0 },
        },
        zones: {
          OH1: ZONES.stripRight,
          L: ZONES.stripRightSeam,
          OH2: ZONES.stripRightFar,
          MB1: ZONES.stripRightShortCenter,
          OPP: ZONES.stripRightShortSide,
        },
      },
      attack: {
        // после приёма перехода нет: диагональный атакует из зоны 4, Д1 из зоны 2
        receive: {
          bench: 'MB2',
          positions: {
            S: { x: 5.76, y: 0.54 },
            OH1: { x: 8.46, y: 3.06 },
            MB1: { x: 3.96, y: 2.52 },
            OPP: { x: 0.72, y: 3.06 },
            OH2: { x: 4.5, y: 7.5 },
            MB2: { x: -0.8, y: 4.14 },
            L: { x: 2.52, y: 5.58 },
          },
          attacks: {
            OPP: ATTACK_POINTS.zone4,
            MB1: ATTACK_POINTS.zone3,
            OH1: ATTACK_POINTS.zone2,
            OH2: ATTACK_POINTS.pipe,
          },
        },
        // после нашей подачи переход: Д1 уходит в зону 4, диагональный в зону 2
        serve: {
          bench: 'MB2',
          positions: {
            S: { x: 5.76, y: 0.54 },
            OH1: { x: 0.72, y: 3.06 },
            MB1: { x: 3.96, y: 2.52 },
            OPP: { x: 8.46, y: 3.06 },
            OH2: { x: 4.5, y: 7.5 },
            MB2: { x: -0.8, y: 4.14 },
            L: { x: 2.52, y: 5.58 },
          },
          attacks: {
            OH1: ATTACK_POINTS.zone4,
            MB1: ATTACK_POINTS.zone3,
            OPP: ATTACK_POINTS.zone2,
            OH2: ATTACK_POINTS.pipe,
          },
        },
      },
      defense: {
        // после приёма перехода нет: диагональный блокирует в зоне 4, Д1 в зоне 2
        receive: {
          // атака из зоны 4 соперника
          4: {
            bench: 'MB2',
            positions: {
              S: { x: 6.5, y: 3.5 },
              OH1: { x: 7.5, y: 0.5 },
              MB1: { x: 6.7, y: 0.5 },
              OPP: { x: 1.44, y: 3 },
              OH2: { x: 8.5, y: 7 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 2.5, y: 5 },
            },
          },
          // атака из зоны 3 соперника
          3: {
            bench: 'MB2',
            positions: {
              S: { x: 7, y: 5 },
              OH1: { x: 7, y: 2.5 },
              MB1: { x: 4.5, y: 0.54 },
              OPP: { x: 2, y: 2.5 },
              OH2: { x: 4.5, y: 8.1 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 2, y: 5 },
            },
          },
          // атака из зоны 2 соперника
          2: {
            bench: 'MB2',
            positions: {
              S: { x: 6.5, y: 5 },
              OH1: { x: 7.56, y: 3 },
              MB1: { x: 2.3, y: 0.5 },
              OPP: { x: 1.5, y: 0.5 },
              OH2: { x: 5.5, y: 7 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 0.5, y: 7 },
            },
          },
        },
        // после нашей подачи переход: Д1 блокирует в зоне 4, диагональный в зоне 2
        serve: {
          // атака из зоны 4 соперника
          4: {
            bench: 'MB2',
            positions: {
              S: { x: 6.5, y: 3.5 },
              OH1: { x: 1.44, y: 3 },
              MB1: { x: 6.7, y: 0.5 },
              OPP: { x: 7.5, y: 0.5 },
              OH2: { x: 8.5, y: 7 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 2.5, y: 5 },
            },
          },
          // атака из зоны 3 соперника
          3: {
            bench: 'MB2',
            positions: {
              S: { x: 7, y: 5 },
              OH1: { x: 2, y: 2.5 },
              MB1: { x: 4.5, y: 0.54 },
              OPP: { x: 7, y: 2.5 },
              OH2: { x: 4.5, y: 8.1 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 2, y: 5 },
            },
          },
          // атака из зоны 2 соперника
          2: {
            bench: 'MB2',
            positions: {
              S: { x: 6.5, y: 5 },
              OH1: { x: 1.5, y: 0.5 },
              MB1: { x: 2.3, y: 0.5 },
              OPP: { x: 7.56, y: 3 },
              OH2: { x: 5.5, y: 7 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 0.5, y: 7 },
            },
          },
        },
      },
    },
    // Выход 2: связующий в зоне 2, подаёт центральный MB2
    2: {
      // расстановка по протоколу
      base: {
        bench: 'L',
        positions: {
          S: { x: 7.56, y: 1.98 },
          OH1: { x: 4.5, y: 1.98 },
          MB1: { x: 1.44, y: 1.98 },
          OPP: { x: 1.44, y: 6.3 },
          OH2: { x: 4.5, y: 6.3 },
          MB2: { x: 7.56, y: 6.3 },
          L: { x: -0.8, y: 4.14 },
        },
      },
      // приём подачи соперника
      receive: {
        bench: 'MB2',
        positions: {
          S: { x: 6, y: 2.5 },
          OH1: { x: 1.5, y: 7 },
          MB1: { x: 1.2, y: 3 },
          OPP: { x: 0.6, y: 8.5 },
          OH2: { x: 4, y: 7 },
          MB2: { x: -0.8, y: 4.14 },
          L: { x: 7.2, y: 6 },
        },
        zones: {
          OH1: ZONES.stripLeft,
          OH2: ZONES.stripLeftSeam,
          L: [...ZONES.stripLeftFar, ...ZONES.stripLeftShortSide],
          MB1: ZONES.stripLeftShortCenter,
        },
      },
      attack: {
        receive: {
          bench: 'MB2',
          positions: {
            S: { x: 5.76, y: 0.54 },
            OH1: { x: 0.72, y: 3.06 },
            MB1: { x: 3.96, y: 2.52 },
            OPP: { x: 7.74, y: 4.86 },
            OH2: { x: 4.5, y: 7.5 },
            MB2: { x: -0.8, y: 4.14 },
            L: { x: 2.52, y: 5.58 },
          },
          attacks: {
            OH1: ATTACK_POINTS.zone4,
            MB1: ATTACK_POINTS.zone3,
            OPP: ATTACK_POINTS.backRight,
            OH2: ATTACK_POINTS.pipe,
          },
        },
        serve: {
          bench: 'L',
          positions: {
            S: { x: 5.76, y: 0.54 },
            OH1: { x: 0.72, y: 3.06 },
            MB1: { x: 3.96, y: 2.52 },
            OPP: { x: 7.74, y: 4.86 },
            OH2: { x: 4.5, y: 7.5 },
            MB2: { x: 2.52, y: 5.58 },
            L: { x: -0.8, y: 4.14 },
          },
          attacks: {
            OH1: ATTACK_POINTS.zone4,
            MB1: ATTACK_POINTS.zone3,
            OPP: ATTACK_POINTS.backRight,
            OH2: ATTACK_POINTS.pipe,
          },
        },
      },
      defense: {
        receive: {
          // атака из зоны 4 соперника
          4: {
            bench: 'MB2',
            positions: {
              S: { x: 7.5, y: 0.5 },
              OH1: { x: 1.44, y: 3 },
              MB1: { x: 6.7, y: 0.5 },
              OPP: { x: 6.5, y: 3.5 },
              OH2: { x: 8.5, y: 7 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 2.5, y: 5 },
            },
          },
          // атака из зоны 3 соперника
          3: {
            bench: 'MB2',
            positions: {
              S: { x: 7, y: 2.5 },
              OH1: { x: 2, y: 2.5 },
              MB1: { x: 4.5, y: 0.54 },
              OPP: { x: 7, y: 5 },
              OH2: { x: 4.5, y: 8.1 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 2, y: 5 },
            },
          },
          // атака из зоны 2 соперника
          2: {
            bench: 'MB2',
            positions: {
              S: { x: 7.56, y: 3 },
              OH1: { x: 1.5, y: 0.5 },
              MB1: { x: 2.3, y: 0.5 },
              OPP: { x: 6.5, y: 5 },
              OH2: { x: 5.5, y: 7 },
              MB2: { x: -0.8, y: 4.14 },
              L: { x: 0.5, y: 7 },
            },
          },
        },
        // MB2 подаёт и остаётся на площадке вместо либеро
        serve: {
          // атака из зоны 4 соперника
          4: {
            bench: 'L',
            positions: {
              S: { x: 7.5, y: 0.5 },
              OH1: { x: 1.44, y: 3 },
              MB1: { x: 6.7, y: 0.5 },
              OPP: { x: 6.5, y: 3.5 },
              OH2: { x: 8.5, y: 7 },
              MB2: { x: 2.5, y: 5 },
              L: { x: -0.8, y: 4.14 },
            },
          },
          // атака из зоны 3 соперника
          3: {
            bench: 'L',
            positions: {
              S: { x: 7, y: 2.5 },
              OH1: { x: 2, y: 2.5 },
              MB1: { x: 4.5, y: 0.54 },
              OPP: { x: 7, y: 5 },
              OH2: { x: 4.5, y: 8.1 },
              MB2: { x: 2, y: 5 },
              L: { x: -0.8, y: 4.14 },
            },
          },
          // атака из зоны 2 соперника
          2: {
            bench: 'L',
            positions: {
              S: { x: 7.56, y: 3 },
              OH1: { x: 1.5, y: 0.5 },
              MB1: { x: 2.3, y: 0.5 },
              OPP: { x: 6.5, y: 5 },
              OH2: { x: 5.5, y: 7 },
              MB2: { x: 0.5, y: 7 },
              L: { x: -0.8, y: 4.14 },
            },
          },
        },
      },
    },
    // Выход 3: связующий в зоне 3
    3: {
      // расстановка по протоколу
      base: {
        bench: 'L',
        positions: {
          S: { x: 4.5, y: 1.98 },
          OH1: { x: 1.44, y: 1.98 },
          MB1: { x: 1.44, y: 6.3 },
          OPP: { x: 4.5, y: 6.3 },
          OH2: { x: 7.56, y: 6.3 },
          MB2: { x: 7.56, y: 1.98 },
          L: { x: -0.8, y: 4.14 },
        },
      },
      // приём подачи соперника
      receive: {
        bench: 'MB1',
        positions: {
          S: { x: 6, y: 1.5 },
          OH1: { x: 1.5, y: 7 },
          MB1: { x: -0.8, y: 4.14 },
          OPP: { x: 5.8, y: 8 },
          OH2: { x: 7.5, y: 6 },
          MB2: { x: 8, y: 2.5 },
          L: { x: 4.5, y: 7 },
        },
        zones: {
          OH1: ZONES.stripLeft,
          L: ZONES.stripLeftSeam,
          OH2: [...ZONES.stripLeftFar, ...ZONES.stripLeftShortSide],
          MB2: ZONES.stripLeftShortCenter,
        },
      },
      // начало розыгрыша на атаку не влияет
      attack: {
        bench: 'MB1',
        positions: {
          S: { x: 5.76, y: 0.54 },
          OH1: { x: 0.72, y: 3.06 },
          MB1: { x: -0.8, y: 4.14 },
          OPP: { x: 7.74, y: 4.86 },
          OH2: { x: 4.5, y: 7.5 },
          MB2: { x: 3.96, y: 2.52 },
          L: { x: 2.52, y: 5.58 },
        },
        attacks: {
          OH1: ATTACK_POINTS.zone4,
          MB2: ATTACK_POINTS.zone3,
          OPP: ATTACK_POINTS.backRight,
          OH2: ATTACK_POINTS.pipe,
        },
      },
      // начало розыгрыша на защиту не влияет
      defense: {
        // атака из зоны 4 соперника
        4: {
          bench: 'MB1',
          positions: {
            S: { x: 7.5, y: 0.5 },
            OH1: { x: 1.44, y: 3 },
            MB1: { x: -0.8, y: 4.14 },
            OPP: { x: 6.5, y: 3.5 },
            OH2: { x: 8.5, y: 7 },
            MB2: { x: 6.7, y: 0.5 },
            L: { x: 2.5, y: 5 },
          },
        },
        // атака из зоны 3 соперника
        3: {
          bench: 'MB1',
          positions: {
            S: { x: 7, y: 2.5 },
            OH1: { x: 2, y: 2.5 },
            MB1: { x: -0.8, y: 4.14 },
            OPP: { x: 7, y: 5 },
            OH2: { x: 4.5, y: 8.1 },
            MB2: { x: 4.5, y: 0.54 },
            L: { x: 2, y: 5 },
          },
        },
        // атака из зоны 2 соперника
        2: {
          bench: 'MB1',
          positions: {
            S: { x: 7.56, y: 3 },
            OH1: { x: 1.5, y: 0.5 },
            MB1: { x: -0.8, y: 4.14 },
            OPP: { x: 6.5, y: 5 },
            OH2: { x: 5.5, y: 7 },
            MB2: { x: 2.3, y: 0.5 },
            L: { x: 0.5, y: 7 },
          },
        },
      },
    },
    // Выход 4: связующий в зоне 4
    4: {
      // расстановка по протоколу
      base: {
        bench: 'L',
        positions: {
          S: { x: 1.44, y: 1.98 },
          OH1: { x: 1.44, y: 6.3 },
          MB1: { x: 4.5, y: 6.3 },
          OPP: { x: 7.56, y: 6.3 },
          OH2: { x: 7.56, y: 1.98 },
          MB2: { x: 4.5, y: 1.98 },
          L: { x: -0.8, y: 4.14 },
        },
      },
      // приём подачи соперника
      receive: {
        bench: 'MB1',
        positions: {
          S: { x: 1.3, y: 0.5 },
          OH1: { x: 1.5, y: 7 },
          MB1: { x: -0.8, y: 4.14 },
          OPP: { x: 8.5, y: 8 },
          OH2: { x: 7.2, y: 6 },
          MB2: { x: 2, y: 2.5 },
          L: { x: 4.5, y: 7 },
        },
        zones: {
          OH1: ZONES.stripLeft,
          L: ZONES.stripLeftSeam,
          OH2: [...ZONES.stripLeftFar, ...ZONES.stripLeftShortSide],
          MB2: ZONES.stripLeftShortCenter,
        },
      },
      // начало розыгрыша на атаку не влияет
      attack: {
        bench: 'MB1',
        positions: {
          S: { x: 5.76, y: 0.54 },
          OH1: { x: 4.5, y: 7.5 },
          MB1: { x: -0.8, y: 4.14 },
          OPP: { x: 7.74, y: 4.86 },
          OH2: { x: 0.72, y: 3.06 },
          MB2: { x: 3.96, y: 2.52 },
          L: { x: 2.52, y: 5.58 },
        },
        attacks: {
          OH2: ATTACK_POINTS.zone4,
          MB2: ATTACK_POINTS.zone3,
          OPP: ATTACK_POINTS.backRight,
          OH1: ATTACK_POINTS.pipe,
        },
      },
      // начало розыгрыша на защиту не влияет
      defense: {
        // атака из зоны 4 соперника
        4: {
          bench: 'MB1',
          positions: {
            S: { x: 7.5, y: 0.5 },
            OH1: { x: 8.5, y: 7 },
            MB1: { x: -0.8, y: 4.14 },
            OPP: { x: 6.5, y: 3.5 },
            OH2: { x: 1.44, y: 3 },
            MB2: { x: 6.7, y: 0.5 },
            L: { x: 2.5, y: 5 },
          },
        },
        // атака из зоны 3 соперника
        3: {
          bench: 'MB1',
          positions: {
            S: { x: 7, y: 2.5 },
            OH1: { x: 4.5, y: 8.1 },
            MB1: { x: -0.8, y: 4.14 },
            OPP: { x: 7, y: 5 },
            OH2: { x: 2, y: 2.5 },
            MB2: { x: 4.5, y: 0.54 },
            L: { x: 2, y: 5 },
          },
        },
        // атака из зоны 2 соперника
        2: {
          bench: 'MB1',
          positions: {
            S: { x: 7.56, y: 3 },
            OH1: { x: 5.5, y: 7 },
            MB1: { x: -0.8, y: 4.14 },
            OPP: { x: 6.5, y: 5 },
            OH2: { x: 1.5, y: 0.5 },
            MB2: { x: 2.3, y: 0.5 },
            L: { x: 0.5, y: 7 },
          },
        },
      },
    },
    // Выход 5: связующий в зоне 5, подаёт центральный MB1
    5: {
      // расстановка по протоколу
      base: {
        bench: 'L',
        positions: {
          S: { x: 1.44, y: 6.3 },
          OH1: { x: 4.5, y: 6.3 },
          MB1: { x: 7.56, y: 6.3 },
          OPP: { x: 7.56, y: 1.98 },
          OH2: { x: 4.5, y: 1.98 },
          MB2: { x: 1.44, y: 1.98 },
          L: { x: -0.8, y: 4.14 },
        },
      },
      // приём подачи соперника
      receive: {
        bench: 'MB1',
        positions: {
          S: { x: 0.9, y: 2.5 },
          OH1: { x: 4.5, y: 7 },
          MB1: { x: -0.8, y: 4.14 },
          OPP: { x: 7.5, y: 3 },
          OH2: { x: 1.5, y: 7 },
          MB2: { x: 1.5, y: 1.5 },
          L: { x: 7.2, y: 6 },
        },
        zones: {
          OH2: ZONES.stripLeft,
          OH1: ZONES.stripLeftSeam,
          L: ZONES.stripLeftFar,
          MB2: ZONES.stripLeftShortCenter,
          OPP: ZONES.stripLeftShortSide,
        },
      },
      attack: {
        receive: {
          bench: 'MB1',
          positions: {
            S: { x: 5.76, y: 0.54 },
            OH1: { x: 4.5, y: 7.5 },
            MB1: { x: -0.8, y: 4.14 },
            OPP: { x: 8.46, y: 3.06 },
            OH2: { x: 0.72, y: 3.06 },
            MB2: { x: 3.96, y: 2.52 },
            L: { x: 2.52, y: 5.58 },
          },
          attacks: {
            OH2: ATTACK_POINTS.zone4,
            MB2: ATTACK_POINTS.zone3,
            OPP: ATTACK_POINTS.zone2,
            OH1: ATTACK_POINTS.pipe,
          },
        },
        serve: {
          bench: 'L',
          positions: {
            S: { x: 5.76, y: 0.54 },
            OH1: { x: 4.5, y: 7.5 },
            MB1: { x: 2.52, y: 5.58 },
            OPP: { x: 8.46, y: 3.06 },
            OH2: { x: 0.72, y: 3.06 },
            MB2: { x: 3.96, y: 2.52 },
            L: { x: -0.8, y: 4.14 },
          },
          attacks: {
            OH2: ATTACK_POINTS.zone4,
            MB2: ATTACK_POINTS.zone3,
            OPP: ATTACK_POINTS.zone2,
            OH1: ATTACK_POINTS.pipe,
          },
        },
      },
      defense: {
        receive: {
          // атака из зоны 4 соперника
          4: {
            bench: 'MB1',
            positions: {
              S: { x: 6.5, y: 3.5 },
              OH1: { x: 8.5, y: 7 },
              MB1: { x: -0.8, y: 4.14 },
              OPP: { x: 7.5, y: 0.5 },
              OH2: { x: 1.44, y: 3 },
              MB2: { x: 6.7, y: 0.5 },
              L: { x: 2.5, y: 5 },
            },
          },
          // атака из зоны 3 соперника
          3: {
            bench: 'MB1',
            positions: {
              S: { x: 7, y: 5 },
              OH1: { x: 4.5, y: 8.1 },
              MB1: { x: -0.8, y: 4.14 },
              OPP: { x: 7, y: 2.5 },
              OH2: { x: 2, y: 2.5 },
              MB2: { x: 4.5, y: 0.54 },
              L: { x: 2, y: 5 },
            },
          },
          // атака из зоны 2 соперника
          2: {
            bench: 'MB1',
            positions: {
              S: { x: 6.5, y: 5 },
              OH1: { x: 5.5, y: 7 },
              MB1: { x: -0.8, y: 4.14 },
              OPP: { x: 7.56, y: 3 },
              OH2: { x: 1.5, y: 0.5 },
              MB2: { x: 2.3, y: 0.5 },
              L: { x: 0.5, y: 7 },
            },
          },
        },
        // MB1 подаёт и остаётся на площадке вместо либеро
        serve: {
          // атака из зоны 4 соперника
          4: {
            bench: 'L',
            positions: {
              S: { x: 6.5, y: 3.5 },
              OH1: { x: 8.5, y: 7 },
              MB1: { x: 2.5, y: 5 },
              OPP: { x: 7.5, y: 0.5 },
              OH2: { x: 1.44, y: 3 },
              MB2: { x: 6.7, y: 0.5 },
              L: { x: -0.8, y: 4.14 },
            },
          },
          // атака из зоны 3 соперника
          3: {
            bench: 'L',
            positions: {
              S: { x: 7, y: 5 },
              OH1: { x: 4.5, y: 8.1 },
              MB1: { x: 2, y: 5 },
              OPP: { x: 7, y: 2.5 },
              OH2: { x: 2, y: 2.5 },
              MB2: { x: 4.5, y: 0.54 },
              L: { x: -0.8, y: 4.14 },
            },
          },
          // атака из зоны 2 соперника
          2: {
            bench: 'L',
            positions: {
              S: { x: 6.5, y: 5 },
              OH1: { x: 5.5, y: 7 },
              MB1: { x: 0.5, y: 7 },
              OPP: { x: 7.56, y: 3 },
              OH2: { x: 1.5, y: 0.5 },
              MB2: { x: 2.3, y: 0.5 },
              L: { x: -0.8, y: 4.14 },
            },
          },
        },
      },
    },
    // Выход 6: связующий в зоне 6
    6: {
      // расстановка по протоколу
      base: {
        bench: 'L',
        positions: {
          S: { x: 4.5, y: 6.3 },
          OH1: { x: 7.56, y: 6.3 },
          MB1: { x: 7.56, y: 1.98 },
          OPP: { x: 4.5, y: 1.98 },
          OH2: { x: 1.44, y: 1.98 },
          MB2: { x: 1.44, y: 6.3 },
          L: { x: -0.8, y: 4.14 },
        },
      },
      // приём подачи соперника
      receive: {
        bench: 'MB2',
        positions: {
          S: { x: 5.4, y: 1.5 },
          OH1: { x: 7.2, y: 6 },
          MB1: { x: 7.74, y: 3 },
          OPP: { x: 5.4, y: 0.72 },
          OH2: { x: 1.62, y: 7 },
          MB2: { x: -0.8, y: 4.14 },
          L: { x: 4.5, y: 7 },
        },
        zones: {
          OH2: ZONES.stripLeft,
          L: ZONES.stripLeftSeam,
          OH1: ZONES.stripLeftFar,
          MB1: ZONES.stripLeftShortCenter,
          OPP: ZONES.stripLeftShortSide,
        },
      },
      // начало розыгрыша на атаку не влияет
      attack: {
        bench: 'MB2',
        positions: {
          S: { x: 5.76, y: 0.54 },
          OH1: { x: 4.5, y: 7.5 },
          MB1: { x: 3.96, y: 2.52 },
          OPP: { x: 8.46, y: 3.06 },
          OH2: { x: 0.72, y: 3.06 },
          MB2: { x: -0.8, y: 4.14 },
          L: { x: 2.52, y: 5.58 },
        },
        attacks: {
          OH2: ATTACK_POINTS.zone4,
          MB1: ATTACK_POINTS.zone3,
          OPP: ATTACK_POINTS.zone2,
          OH1: ATTACK_POINTS.pipe,
        },
      },
      // начало розыгрыша на защиту не влияет
      defense: {
        // атака из зоны 4 соперника
        4: {
          bench: 'MB2',
          positions: {
            S: { x: 6.5, y: 3.5 },
            OH1: { x: 8.5, y: 7 },
            MB1: { x: 6.7, y: 0.5 },
            OPP: { x: 7.5, y: 0.5 },
            OH2: { x: 1.44, y: 3 },
            MB2: { x: -0.8, y: 4.14 },
            L: { x: 2.5, y: 5 },
          },
        },
        // атака из зоны 3 соперника
        3: {
          bench: 'MB2',
          positions: {
            S: { x: 7, y: 5 },
            OH1: { x: 4.5, y: 8.1 },
            MB1: { x: 4.5, y: 0.54 },
            OPP: { x: 7, y: 2.5 },
            OH2: { x: 2, y: 2.5 },
            MB2: { x: -0.8, y: 4.14 },
            L: { x: 2, y: 5 },
          },
        },
        // атака из зоны 2 соперника
        2: {
          bench: 'MB2',
          positions: {
            S: { x: 6.5, y: 5 },
            OH1: { x: 5.5, y: 7 },
            MB1: { x: 2.3, y: 0.5 },
            OPP: { x: 7.56, y: 3 },
            OH2: { x: 1.5, y: 0.5 },
            MB2: { x: -0.8, y: 4.14 },
            L: { x: 0.5, y: 7 },
          },
        },
      },
    },
  },
}
