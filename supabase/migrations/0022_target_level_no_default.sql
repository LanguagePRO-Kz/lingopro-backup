-- 0022: убрать «тихий C1» на уровне БД (Блок 2 захода 2026-07-21).
--
-- Корень: 0001 добавила profiles.target_level DEFAULT 'C1' — каждый профиль,
-- созданный без явного выбора цели, получал C1 от самой БД, минуя весь код.
-- Продукт продаёт цель B2 (порог вуза); C1 — только явный выбор студента.
--
-- 1) Снять дефолт: новые профили рождаются с target_level NULL, а NULL весь
--    код уже читает как B2 (exam-plan.ts:103, useStats.ts:162, snapshot.ts:108,
--    daily-plan.ts:462, api/ai/route.ts:75 — везде `=== 'C1' ? 'C1' : 'B2'`).
alter table profiles alter column target_level drop default;

-- 2) Стереть мусорный C1 у тех, за кого его поставила БД, а не человек.
--    Дискриминатор доказан данными: saveExamPlanToProfile пишет target_level
--    ВМЕСТЕ с exam_date_mode — mode IS NULL значит «выбор цели никогда не
--    сохранялся», C1 там чистый артефакт дефолта (13 профилей на 21.07,
--    включая maksut.tol/romaroma/tima98). Выбравших C1 осознанно (mode задан)
--    не трогаем.
update profiles
   set target_level = null
 where target_level = 'C1'
   and exam_date_mode is null;
