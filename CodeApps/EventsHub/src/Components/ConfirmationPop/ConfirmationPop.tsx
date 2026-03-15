import { Modal } from '@fluentui/react/lib/Modal';
import { PrimaryButton, DefaultButton } from '@fluentui/react/lib/Button';
import { Stack } from '@fluentui/react/lib/Stack';
import { Text } from '@fluentui/react/lib/Text';
import {
    Checkmark20Regular,
    ErrorCircle20Regular,
    Warning20Regular,
    Info20Regular
} from '@fluentui/react-icons';
import './ConfirmationPop.css';

interface ConfirmationPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm?: () => void;
    title?: string;
    body: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    showConfirmButton?: boolean;
}

export default function ConfirmationPopup({
    isOpen,
    onClose,
    onConfirm,
    title,
    body,
    confirmText = 'OK',
    cancelText = 'Cancel',
    type = 'info',
    showConfirmButton = false
}: ConfirmationPopupProps) {
    const getIconComponent = () => {
        switch (type) {
            case 'success':
                return <Checkmark20Regular className='success-icon' />;
            case 'error':
                return <ErrorCircle20Regular className='error-icon' />;
            case 'warning':
                return <Warning20Regular className='warning-icon' />;
            default:
                return <Info20Regular className='info-icon' />;
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onDismiss={onClose}
            isBlocking={false}
            containerClassName="confirmation-modal"
        >
            <div className="modal-header">
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
                    {getIconComponent()}
                    {title && <Text variant="xLarge" className="modal-title">{title}</Text>}
                </Stack>
            </div>
            <div className="modal-body">
                <Text variant="medium" className="modal-body-text">
                    {body}
                </Text>
            </div>
            <div className="modal-footer">
                <Stack horizontal horizontalAlign="end" tokens={{ childrenGap: 10 }}>
                    {showConfirmButton && onConfirm && (
                        <>
                            <DefaultButton
                                text={cancelText}
                                onClick={onClose}
                            />
                            <PrimaryButton
                                text={confirmText}
                                className="primary-button"
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                            />
                        </>
                    )}
                    {!showConfirmButton && (
                        <PrimaryButton
                            text={confirmText}
                            className="primary-button"
                            onClick={onClose}
                        />
                    )}
                </Stack>
            </div>
        </Modal>
    );
} 