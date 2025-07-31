export interface Mail {
  from?: string;
  to: string;
  cc?: string[];
  subject?: string;
  text?: string;
  jobId?: string;
  priority?: number;
  tracing?: string;
  [key: string]: any;
}
