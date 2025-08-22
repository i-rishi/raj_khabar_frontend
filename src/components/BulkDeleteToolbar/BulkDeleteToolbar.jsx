import React, { useState } from 'react';
import { Box, Button, Stack, Typography, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function BulkDeleteToolbar({
  selectedCount,
  totalCount,
  contentType,
  onSelectAll,
  onClearSelection,
  onBulkDelete,
  isLoading,
}) {
  const hasSelection = selectedCount > 0;
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirm = () => {
    setConfirmOpen(false);
    onBulkDelete(contentType);
  };

  return (
    <Box sx={{
      mb: 2,
      p: 2,
      border: '1px solid #800000',
      bgcolor: '#fffaf5',
      borderRadius: 1,
    }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
        <Typography sx={{ color: '#800000', fontWeight: 600 }}>
          {hasSelection ? `${selectedCount} selected` : `Select items to delete`}
          {totalCount ? ` • ${totalCount} total` : ''}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            size="small"
            disabled={isLoading}
            onClick={onSelectAll}
            sx={{ color: '#800000', borderColor: '#800000' }}
          >
            Select All
          </Button>
          <Button
            variant="outlined"
            size="small"
            disabled={isLoading || !hasSelection}
            onClick={onClearSelection}
            sx={{ color: '#800000', borderColor: '#800000' }}
          >
            Clear
          </Button>
          <Button
            variant="contained"
            color="error"
            size="small"
            startIcon={<DeleteIcon />}
            disabled={isLoading || !hasSelection}
            onClick={() => setConfirmOpen(true)}
          >
            {isLoading ? 'Deleting...' : 'Bulk Delete'}
          </Button>
        </Stack>
      </Stack>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Bulk Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedCount} item(s)? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirm} disabled={isLoading}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default BulkDeleteToolbar;

