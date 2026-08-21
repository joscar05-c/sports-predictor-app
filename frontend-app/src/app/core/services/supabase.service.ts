import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private readonly client: SupabaseClient;

  constructor() {
    this.client = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get from() {
    return this.client.from.bind(this.client);
  }

  get rpc() {
    return this.client.rpc.bind(this.client);
  }

  get functions() {
    return this.client.functions;
  }

  get auth() {
    return this.client.auth;
  }

  /** Invoke a Supabase Edge Function */
  invoke<T = unknown>(functionName: string, options?: { body?: Record<string, unknown> }) {
    return this.client.functions.invoke<T>(functionName, options);
  }
}
