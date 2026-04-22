/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AuthProvider } from './hooks/use-auth';
import { MainLayout } from './components/layout';
import { Toaster } from '@/components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <MainLayout />
      <Toaster position="top-center" />
    </AuthProvider>
  );
}
