/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AdminLayout from './layouts/AdminLayout';
import { AIProvider } from './ai/context/AIContext';

export default function App() {
  return (
    <AIProvider>
      <AdminLayout />
    </AIProvider>
  );
}

