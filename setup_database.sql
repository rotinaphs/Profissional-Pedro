
-- 1. Criação da tabela de configuração
create table if not exists portfolio_config (
  id text primary key,
  content jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Habilitar Row Level Security (RLS)
alter table portfolio_config enable row level security;

-- 3. Políticas de Acesso para a Tabela
-- Permitir leitura pública (necessário para o site carregar)
create policy "Public Read Access" 
on portfolio_config for select 
using (true);

-- Permitir insert/update apenas para usuários logados (Admin)
create policy "Authenticated Upsert Access" 
on portfolio_config for insert 
with check (auth.role() = 'authenticated');

create policy "Authenticated Update Access" 
on portfolio_config for update 
using (auth.role() = 'authenticated');

-- 4. Inserir registro inicial (se não existir)
insert into portfolio_config (id, content)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;

-- 5. Configuração do Storage (Imagens)
-- Nota: A criação do bucket geralmente é feita via Dashboard ou API, 
-- mas inserimos aqui para garantir a referência se o sistema permitir.
insert into storage.buckets (id, name, public) 
values ('portfolio-images', 'portfolio-images', true)
on conflict (id) do nothing;

-- 6. Políticas de Acesso para o Storage
-- Leitura pública das imagens
create policy "Public Select Images" 
on storage.objects for select 
using ( bucket_id = 'portfolio-images' );

-- Upload/Update/Delete apenas para autenticados
create policy "Auth Insert Images" 
on storage.objects for insert 
with check ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );

create policy "Auth Update Images" 
on storage.objects for update 
with check ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );

create policy "Auth Delete Images" 
on storage.objects for delete 
using ( bucket_id = 'portfolio-images' and auth.role() = 'authenticated' );
