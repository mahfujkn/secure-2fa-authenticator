import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { TOTPAccount } from '../../types/account';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export interface DeleteAccountModalProps {
  account: TOTPAccount | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (id: string) => Promise<unknown>;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  account,
  isOpen,
  onClose,
  onConfirmDelete,
}) => {
  if (!account) return null;

  const handleDelete = async () => {
    await onConfirmDelete(account.id);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Account?"
      maxWidth="380px"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            icon={<Trash2 size={14} />}
          >
            Delete Account
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div
          style={{
            padding: '12px',
            backgroundColor: 'var(--color-bg-input)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border-subtle)',
          }}
        >
          <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {account.issuer}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
            {account.account}
          </p>
        </div>

        <div
          style={{
            padding: '10px 12px',
            backgroundColor: 'var(--color-danger-subtle)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
          }}
        >
          <AlertTriangle size={16} color="var(--color-danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '11px', color: 'var(--color-danger-hover)', lineHeight: 1.4 }}>
            This will permanently remove this TOTP secret from your browser's local storage. This action cannot be undone.
          </p>
        </div>
      </div>
    </Modal>
  );
};
