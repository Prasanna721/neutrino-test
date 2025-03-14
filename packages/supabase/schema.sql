CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    name text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Testsuites Table
CREATE TABLE IF NOT EXISTS public.testsuites (
    id varchar(16) PRIMARY KEY DEFAULT encode(gen_random_bytes(8), 'hex'),
    user_id uuid,
    name text NOT NULL,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
    id serial PRIMARY KEY,
    testsuite_id varchar(16) REFERENCES public.testsuites(id) ON DELETE CASCADE,
    description text NOT NULL,
    order_index integer NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT unique_testsuite_order UNIQUE (testsuite_id, order_index)
);

-- Pods Table 
CREATE TABLE IF NOT EXISTS public.pods (
    id serial PRIMARY KEY,
    testsuite_id varchar(16) REFERENCES public.testsuites(id) ON DELETE CASCADE,
    status text NOT NULL,             
    task_status text NOT NULL,
    docker_container_id text,         
    docker_image text,                 
    host text,                         
    error_message text,               
    jobname text NOT NULL UNIQUE,  
    environment text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    started_at timestamptz NOT NULL DEFAULT now(),
    finished_at timestamptz           
);

-- Logs Table 
CREATE TABLE IF NOT EXISTS public.logs (
    id serial PRIMARY KEY,
    pod_id integer REFERENCES public.pods(id) ON DELETE CASCADE,
    timestamp timestamptz NOT NULL DEFAULT now(),
    level text NOT NULL, 
    message jsonb NOT NULL,
    meta jsonb
);

-- Images Table 
CREATE TABLE IF NOT EXISTS public.browser_actions (
    id serial PRIMARY KEY,
    jobname text REFERENCES public.pods(jobname) ON DELETE CASCADE,
    pod_id integer REFERENCES public.pods(id) ON DELETE CASCADE,
    file_path text NOT NULL,       
    file_name text NOT NULL, 
    page_url text,       
    mime_type text,                 
    image_type text,                
    details jsonb,                   
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_testsuites_user_id ON public.testsuites(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_testsuite_id ON public.tasks(testsuite_id);
CREATE INDEX IF NOT EXISTS idx_pods_testsuite_id ON public.pods(testsuite_id);
CREATE INDEX IF NOT EXISTS idx_logs_pod_id ON public.logs(pod_id);

--------------------------------------------------------------------------------
-- Trigger function to automatically set order_index on task insertion
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_task_order_index() 
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_index IS NULL THEN
    SELECT COALESCE(MAX(order_index), 0) + 1 
      INTO NEW.order_index
      FROM public.tasks
      WHERE testsuite_id = NEW.testsuite_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the above function before inserting a new task
CREATE TRIGGER before_insert_tasks_order_index
BEFORE INSERT ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION set_task_order_index();

--------------------------------------------------------------------------------
-- Trigger function to reorder tasks after a deletion
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION reorder_tasks_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasks
  SET order_index = order_index - 1
  WHERE testsuite_id = OLD.testsuite_id
    AND order_index > OLD.order_index;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the above function after a task deletion
CREATE TRIGGER after_delete_tasks_reorder
AFTER DELETE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION reorder_tasks_after_delete();
