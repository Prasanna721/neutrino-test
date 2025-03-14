CREATE POLICY "Allow anon read for browser-actions-bucket"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'browser-actions-bucket');
  
CREATE POLICY "Allow anon insert for browser-actions-bucket"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'browser-actions-bucket');


