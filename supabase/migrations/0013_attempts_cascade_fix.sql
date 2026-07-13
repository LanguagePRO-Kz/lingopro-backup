-- ---------------------------------------------------------------------
-- 0013: замок attempts не должен блокировать удаление АККАУНТА.
--
-- Находка живой RLS-проверки 13.07: auth.admin.deleteUser() падает —
-- каскадный DELETE (on delete cascade от auth.users) упирается в
-- append-only триггер. Значит удалить студента (запрос «удалите мои
-- данные», уборка тестовых аккаунтов) невозможно вообще.
--
-- Фикс: DELETE пропускается ТОЛЬКО когда родительского пользователя уже
-- нет (каскад от удаления аккаунта); прямой DELETE при живом юзере
-- по-прежнему блокируется для всех ролей, UPDATE блокируется всегда.
-- security definer — триггеру нужно читать auth.users независимо от роли.
-- ---------------------------------------------------------------------

create or replace function attempts_block_mutation() returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if tg_op = 'DELETE' and not exists (select 1 from auth.users u where u.id = old.user_id) then
    return old; -- каскад от удаления аккаунта: родителя уже нет
  end if;
  raise exception 'attempts is append-only: % is not allowed', tg_op;
end;
$$;

-- триггер уже привязан к функции (0012), пересоздавать не нужно.

-- уборка одноразового юзера RLS-проверки (создан прогоном 13.07, удалить
-- его до этого фикса было нельзя):
--   delete from auth.users where email like 'lingopro.rls.test.%@example.com';
