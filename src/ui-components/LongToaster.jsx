import { Toaster } from 'react-hot-toast';

export default function LongToaster() {
  return (
    <Toaster
      toastOptions={{
        style: {
          maxWidth: '500px',
        },
        success: {
          duration: 3000
        }
      }}
    />
  )
}