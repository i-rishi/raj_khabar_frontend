/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  IconButton,
  TextField,
  Button,
  Stack,
  Chip,
  Checkbox,
  MenuItem,
  Select,
  Tooltip,
  FormControl,
  InputLabel,
  Avatar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon, Save as SaveIcon, Close as CloseIcon, Link as LinkIcon, Public as PublicIcon, Policy as PolicyIcon } from '@mui/icons-material';
import { API_BASE_URL } from '../../config';
import BulkDeleteToolbar from '../../components/BulkDeleteToolbar/BulkDeleteToolbar';
import useBulkDelete from '../../hooks/useBulkDelete';
import { useToast } from '../../context/ToastContext';

const PRIMARY = '#800000';
const ACCENT_BG = '#fffaf5';
const SECONDARY = '#ffb6b6';

const allowedSocialSlugs = ['instagram','whatsapp','telegram','facebook','x','youtube'];

const slugIcon = (slug, type) => {
  if (type === 'policy') return <PolicyIcon />;
  switch (slug) {
    case 'instagram':
      return <Avatar sx={{ bgcolor: '#E1306C' }}>IG</Avatar>;
    case 'whatsapp':
      return <Avatar sx={{ bgcolor: '#25D366' }}>WA</Avatar>;
    case 'telegram':
      return <Avatar sx={{ bgcolor: '#0088cc' }}>TG</Avatar>;
    case 'facebook':
      return <Avatar sx={{ bgcolor: '#1877F2' }}>f</Avatar>;
    case 'x':
      return <Avatar sx={{ bgcolor: '#000' }}>X</Avatar>;
    case 'youtube':
      return <Avatar sx={{ bgcolor: '#FF0000' }}>YT</Avatar>;
    default:
      return <Avatar sx={{ bgcolor: PRIMARY }}><PublicIcon fontSize="small" /></Avatar>;
  }
};

export function SocialLinksManagement() {
  const { showToast } = useToast();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', slug: '', link: '', type: 'social' });
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  const {
    selectedItems,
    selectedCount,
    isLoading: isBulkDeleting,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    performBulkDelete,
  } = useBulkDelete(
    'social-media',
    () => {
      showToast('Selected social links deleted', 'success');
      fetchLinks();
    },
    (err) => showToast(err?.message || 'Failed to delete selected social links', 'error')
  );

  const filtered = useMemo(() => {
    return links.filter(l =>
      (!filterType || l.type === filterType) &&
      (!search || l.name?.toLowerCase().includes(search.toLowerCase()) || l.slug?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [links, filterType, search]);

  useEffect(() => {
    fetchLinks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/social/get-social-link`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setLinks(data.data || []);
        clearSelection();
      } else {
        showToast(data.message || 'Failed to fetch social links', 'error');
      }
    } catch (e) {
      showToast('Failed to fetch social links', 'error');
    }
    setLoading(false);
  };

  const startEdit = (link) => {
    setEditingId(link._id);
    setEditForm({ name: link.name || '', slug: link.slug || '', link: link.link || '', type: link.type || 'social' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', slug: '', link: '', type: 'social' });
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/social/update-social-link/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Social link updated', 'success');
        setEditingId(null);
        fetchLinks();
      } else {
        showToast(data.message || 'Failed to update social link', 'error');
      }
    } catch (e) {
      showToast('Failed to update social link', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this social link?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/social/delete/${id}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        showToast('Social link deleted', 'success');
        fetchLinks();
      } else {
        showToast(data.message || 'Failed to delete social link', 'error');
      }
    } catch (e) {
      showToast('Failed to delete social link', 'error');
    }
  };

  const handleCreate = async () => {
    const payload = { name: 'New Link', slug: 'instagram', link: 'https://instagram.com/your', type: 'social' };
    try {
      const res = await fetch(`${API_BASE_URL}/api/social/create-social-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Social link created', 'success');
        fetchLinks();
      } else {
        showToast(data.message || 'Failed to create social link', 'error');
      }
    } catch (e) {
      showToast('Failed to create social link', 'error');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ color: PRIMARY, fontWeight: 800 }}>
          Social Links Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
          sx={{ background: PRIMARY, color: '#fffaf5', '&:hover': { background: '#4d0000' } }}
        >
          Create Social Link
        </Button>
      </Stack>

      <Paper sx={{ p: 2, mb: 2, background: ACCENT_BG, border: `1px solid ${PRIMARY}` }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
          <TextField
            label="Search by name or slug"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 220 }}
          />
          <Select
            value={filterType}
            size="small"
            displayEmpty
            onChange={(e) => setFilterType(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="social">Social</MenuItem>
            <MenuItem value="policy">Policy</MenuItem>
          </Select>
          <Button variant="outlined" onClick={() => { setSearch(''); setFilterType(''); }} sx={{ color: PRIMARY, borderColor: PRIMARY }}>Reset</Button>
        </Stack>
      </Paper>

      {selectedCount > 0 && (
        <BulkDeleteToolbar
          selectedCount={selectedCount}
          totalCount={filtered.length}
          contentType="social-media"
          onSelectAll={() => selectAll(filtered.map((l) => l._id))}
          onClearSelection={clearSelection}
          onBulkDelete={performBulkDelete}
          isLoading={isBulkDeleting}
        />
      )}

      <Grid container spacing={3}>
        {loading ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', border: `1px dashed ${PRIMARY}` }}>
              <Typography sx={{ color: PRIMARY }}>Loading...</Typography>
            </Paper>
          </Grid>
        ) : filtered.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center', border: `1px dashed ${PRIMARY}` }}>
              <Typography sx={{ color: PRIMARY }}>No social links found.</Typography>
            </Paper>
          </Grid>
        ) : (
          filtered.map((row) => (
            <Grid item xs={12} sm={6} md={4} key={row._id}>
              <Card
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 4,
                  px: 1,
                  pt: 1,
                  pb: 2,
                  background: `linear-gradient(180deg, ${ACCENT_BG} 0%, #fff 100%)`,
                  boxShadow: '0 10px 30px rgba(128,0,0,0.18)',
                  border: `1px solid ${PRIMARY}22`,
                  transition: 'transform .25s ease, box-shadow .25s ease',
                  '&:before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(800px 200px at -10% -20%, ${PRIMARY}0F, transparent 60%), radial-gradient(600px 200px at 120% -30%, ${PRIMARY}12, transparent 60%)`
                  },
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 16px 40px rgba(128,0,0,0.28)'
                  }
                }}
              >
                <CardHeader
                  avatar={<Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: `linear-gradient(135deg, ${PRIMARY} 0%, #a0522d 100%)`,
                      color: '#fff',
                      boxShadow: '0 6px 16px rgba(128,0,0,0.35)'
                    }}
                  >{slugIcon(row.slug, row.type)}</Box>}
                  title={<Typography sx={{ fontWeight: 900, color: '#4b0000', letterSpacing: .3 }}>{row.name}</Typography>}
                  subheader={<Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={row.type} sx={{ bgcolor: '#ffe0e0', color: PRIMARY, fontWeight: 800, textTransform: 'uppercase' }} />
                    <Chip size="small" label={row.slug} sx={{ bgcolor: SECONDARY, color: PRIMARY, fontWeight: 800 }} />
                  </Stack>}
                  action={
                    <Checkbox
                      checked={isSelected(row._id)}
                      onChange={() => toggleSelection(row._id)}
                      sx={{ color: PRIMARY, '&.Mui-checked': { color: PRIMARY } }}
                    />
                  }
                  sx={{ pb: 0.5 }}
                />
                <CardContent sx={{ pt: 1 }}>
                  <Stack spacing={1.25}>
                    <Tooltip title={row.link}>
                      <Button
                        component="a"
                        href={row.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        startIcon={<LinkIcon />}
                        sx={{
                          alignSelf: 'flex-start',
                          color: PRIMARY,
                          borderColor: PRIMARY,
                          textTransform: 'none',
                          border: `1px dashed ${PRIMARY}`,
                          bgcolor: '#fffaf5',
                          '&:hover': { bgcolor: '#fff3ed', borderColor: '#4d0000', color: '#4d0000' }
                        }}
                      >{new URL(row.link, window.location.origin).hostname}</Button>
                    </Tooltip>
                  </Stack>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 1 }}>
                  {editingId === row._id ? (
                    <Stack direction="row" spacing={1} sx={{ width: '100%', alignItems: 'center' }}>
                      <TextField size="small" label="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Type</InputLabel>
                        <Select label="Type" value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                          <MenuItem value="social">social</MenuItem>
                          <MenuItem value="policy">policy</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 140 }}>
                        <InputLabel>Slug</InputLabel>
                        <Select
                          label="Slug"
                          value={editForm.slug}
                          onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })}
                        >
                          {(editForm.type === 'social' ? allowedSocialSlugs : [editForm.slug || 'policy'])
                            .map((s) => (<MenuItem key={s} value={s}>{s}</MenuItem>))}
                        </Select>
                      </FormControl>
                      <TextField size="small" label="Link" value={editForm.link} onChange={(e) => setEditForm({ ...editForm, link: e.target.value })} sx={{ flex: 1 }} />
                      <Button variant="contained" onClick={saveEdit} sx={{ background: PRIMARY, '&:hover': { background: '#4d0000' }}} startIcon={<SaveIcon />}>Save</Button>
                      <Button variant="text" color="error" onClick={cancelEdit} startIcon={<CloseIcon />}>Cancel</Button>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} sx={{ width: '100%', justifyContent: 'flex-end' }}>
                      <Button variant="outlined" onClick={() => startEdit(row)} sx={{ color: PRIMARY, borderColor: PRIMARY, '&:hover': { borderColor: '#4d0000', color: '#4d0000' }}} startIcon={<EditIcon />}>Edit</Button>
                      <Button variant="outlined" color="error" onClick={() => handleDelete(row._id)} startIcon={<DeleteIcon />}>Delete</Button>
                    </Stack>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
}

