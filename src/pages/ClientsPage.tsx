import { useMemo, useState } from 'react';
import { useClients } from '@/hooks/useClients';
import { useServices } from '@/hooks/useServices';
import { useReminders } from '@/hooks/useReminders';
import { buildFollowUpReminder } from '@/lib/reminders';
import { formatDate } from '@/lib/format';
import { ClientsTable } from '@/components/clients/ClientsTable';
import { ClientDetail } from '@/components/clients/ClientDetail';
import { ClientFormModal } from '@/components/clients/ClientFormModal';
import { ServiceFormModal } from '@/components/clients/ServiceFormModal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Client, ServiceRecord } from '@/types';

interface ConfirmState {
  type: 'client' | 'service';
  id: string;
  message: string;
}

export function ClientsPage() {
  const clients = useClients();
  const services = useServices();
  const reminders = useReminders();

  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [clientModal, setClientModal] = useState<{ open: boolean; client?: Client }>({
    open: false,
  });
  const [serviceModal, setServiceModal] = useState<{ open: boolean; service?: ServiceRecord }>({
    open: false,
  });
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const selectedClient = selectedClientId ? clients.get(selectedClientId) : undefined;

  const lastServiceByClient = useMemo(() => {
    const map = new Map<string, ServiceRecord>();
    for (const service of services.items) {
      const current = map.get(service.clientId);
      if (!current || service.date > current.date) {
        map.set(service.clientId, service);
      }
    }
    return map;
  }, [services.items]);

  const filteredClients = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return clients.items;
    return clients.items.filter((client) => {
      const machineText = client.machines
        .map((machine) => `${machine.brand} ${machine.model}`)
        .join(' ')
        .toLowerCase();
      return (
        client.name.toLowerCase().includes(query) ||
        client.phone.toLowerCase().includes(query) ||
        client.address.toLowerCase().includes(query) ||
        machineText.includes(query)
      );
    });
  }, [clients.items, search]);

  const clientServices = useMemo(() => {
    if (!selectedClientId) return [];
    return services.items
      .filter((service) => service.clientId === selectedClientId)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [services.items, selectedClientId]);

  const viewClient = (client: Client) => setSelectedClientId(client.id);
  const backToList = () => setSelectedClientId(null);

  const saveClient = (client: Client) => {
    if (clientModal.client) {
      clients.update(client.id, client);
    } else {
      clients.add(client);
    }
    setClientModal({ open: false });
  };

  const requestDeleteClient = (client: Client) => {
    const count = services.items.filter((service) => service.clientId === client.id).length;
    const message =
      count > 0
        ? `Se eliminará a ${client.name} y sus ${count} servicio(s) asociados. Esta acción no se puede deshacer.`
        : `Se eliminará a ${client.name}. Esta acción no se puede deshacer.`;
    setConfirm({ type: 'client', id: client.id, message });
  };

  const requestDeleteService = (service: ServiceRecord) => {
    setConfirm({
      type: 'service',
      id: service.id,
      message: `Se eliminará el servicio "${service.serviceType}" del ${formatDate(service.date)}. Esta acción no se puede deshacer.`,
    });
  };

  const handleConfirmDelete = () => {
    if (!confirm) return;

    if (confirm.type === 'client') {
      const clientId = confirm.id;
      services.setItems((prev) => prev.filter((service) => service.clientId !== clientId));
      reminders.setItems((prev) => prev.filter((reminder) => reminder.clientId !== clientId));
      clients.remove(clientId);
      if (selectedClientId === clientId) setSelectedClientId(null);
    } else {
      const serviceId = confirm.id;
      services.remove(serviceId);
      reminders.setItems((prev) => prev.filter((reminder) => reminder.serviceId !== serviceId));
    }

    setConfirm(null);
  };

  const saveService = (service: ServiceRecord, newCopyCount: number) => {
    if (serviceModal.service) {
      services.update(service.id, service);
    } else {
      services.add(service);
    }

    if (selectedClient) {
      const machine = selectedClient.machines[0];
      if (machine && newCopyCount !== machine.copyCounter) {
        clients.update(selectedClient.id, {
          machines: [{ ...machine, copyCounter: newCopyCount }, ...selectedClient.machines.slice(1)],
          updatedAt: new Date().toISOString(),
        });
      }
    }

    if (service.status === 'completed') {
      const hasReminder = reminders.items.some((reminder) => reminder.serviceId === service.id);
      if (!hasReminder) {
        reminders.add(buildFollowUpReminder(service));
      }
    }

    setServiceModal({ open: false });
  };

  return (
    <>
      {selectedClient ? (
        <ClientDetail
          client={selectedClient}
          services={clientServices}
          onBack={backToList}
          onEditClient={() => setClientModal({ open: true, client: selectedClient })}
          onDeleteClient={() => requestDeleteClient(selectedClient)}
          onAddService={() => setServiceModal({ open: true, service: undefined })}
          onEditService={(service) => setServiceModal({ open: true, service })}
          onDeleteService={requestDeleteService}
        />
      ) : (
        <ClientsTable
          clients={filteredClients}
          totalCount={clients.items.length}
          search={search}
          onSearchChange={setSearch}
          lastServiceByClient={lastServiceByClient}
          onCreate={() => setClientModal({ open: true, client: undefined })}
          onView={viewClient}
          onEdit={(client) => setClientModal({ open: true, client })}
          onDelete={requestDeleteClient}
        />
      )}

      <ClientFormModal
        open={clientModal.open}
        client={clientModal.client}
        onClose={() => setClientModal({ open: false })}
        onSave={saveClient}
      />

      <ServiceFormModal
        open={serviceModal.open}
        service={serviceModal.service}
        clientId={selectedClient?.id ?? ''}
        machine={selectedClient?.machines[0]}
        onClose={() => setServiceModal({ open: false })}
        onSave={saveService}
      />

      <ConfirmDialog
        open={confirm !== null}
        title="Confirmar eliminación"
        message={confirm?.message ?? ''}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm(null)}
      />
    </>
  );
}
