/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Stack,
  Chip,
  MenuItem,
  Select,
  Tooltip,
  FormControl,
  Switch,
  InputAdornment,
  IconButton,
  Divider,
  Fade,
  InputLabel
} from '@mui/material';
import {
  EditOutlined,
  DeleteOutline,
  AddOutlined,
  CheckOutlined,
  CloseOutlined,
  SearchOutlined,
  FilterListOutlined,
  RemoveRedEyeOutlined
} from '@mui/icons-material';
import { API_BASE_URL } from '../../config';
import { useToast } from '../../context/ToastContext';

// Using Semantic Tokens mimicking Tailwind via MUI's sx
const colors = {
  background: '#f4f0e4', // Official app neutral background
  card: '#FFFFFF',
  cardHover: '#faf8f5',
  border: '#E5E7EB', // Tailwind gray-200
  textMain: '#111827', // Tailwind gray-900
  textMuted: '#6B7280', // Tailwind gray-500
  primary: '#800000', // Application primary maroon
  danger: '#EF4444',
  success: '#10B981',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  orange: '#F59E0B',
  hover: '#4d0000'
};

const allowedTypes = [
  "banner", "interstitial", "native_advanced",
  "rewarded", "rewarded_interstitial", "app_open"
];

const allowedPlatforms = ["android", "ios", "all"];

export function AdSettingsManagement() {
  const { showToast } = useToast();
  const [adTypes, setAdTypes] = useState([]);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', slug: '', description: '', status: 'active', type: 'banner', platform: 'all', ad_unit_id: ''
  });

  const [filterPlatform, setFilterPlatform] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return adTypes.filter(ad =>
      (!filterPlatform || ad.platform === filterPlatform) &&
      (!search || ad.name?.toLowerCase().includes(search.toLowerCase()) || ad.slug?.toLowerCase().includes(search.toLowerCase()))
    );
  }, [adTypes, filterPlatform, search]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/ad-type/all`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setAdTypes(data.adTypes || []);
        setAdsEnabled(data.adsEnabled || false);
      } else {
        showToast(data.message || 'Failed to connect', 'error');
      }
    } catch (e) {
      showToast('Network error', 'error');
    }
    setLoading(false);
  };

  const handleGlobalAdsToggle = async (e) => {
    const newVal = e.target.checked;
    setAdsEnabled(newVal);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ adsEnabled: newVal })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Ads ${newVal ? 'Live' : 'Paused'}`, 'success');
      } else {
        showToast(data.message || 'Update failed', 'error');
        setAdsEnabled(!newVal);
      }
    } catch (err) {
      showToast('Update failed', 'error');
      setAdsEnabled(!newVal);
    }
  };

  const startEdit = (ad) => {
    setEditingId(ad._id);
    setEditForm({
      name: ad.name || '', slug: ad.slug || '', description: ad.description || '',
      status: ad.status || 'active', type: ad.type || 'banner', platform: ad.platform || 'all',
      ad_unit_id: ad.ad_unit_id || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (existingSlug) => {
    try {
      const url = existingSlug
        ? `${API_BASE_URL}/api/ad-type/update/${existingSlug}`
        : `${API_BASE_URL}/api/ad-type/create`;
      const method = existingSlug ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        showToast('Configuration Updated', 'success');
        setEditingId(null);
        fetchData();
      } else {
        showToast(data.message || 'Error saving', 'error');
      }
    } catch (e) {
      showToast('Error saving', 'error');
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm('Delete this configuration permanently?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/ad-type/delete/${slug}`, { method: 'DELETE', credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        showToast('Deleted cleanly', 'success');
        fetchData();
      } else {
        showToast(data.message || 'Deletion failed', 'error');
      }
    } catch (e) {
      showToast('Deletion failed', 'error');
    }
  };

  const handleCreate = () => {
    if (editingId === 'new') return;
    const newAd = { _id: 'new', name: 'New Unit', slug: `unit-${Date.now()}`, status: 'active', type: 'banner', platform: 'all', ad_unit_id: '' };
    setAdTypes([newAd, ...adTypes]);
    setEditingId('new');
    setEditForm({ ...newAd });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: colors.background, fontFamily: "'Inter', sans-serif" }}>

      {/* Sticky Header mimicking a top bar */}
      <Box sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        bgcolor: 'rgba(245, 240, 235, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: `1px solid rgba(0,0,0,0.05)`,
        px: { xs: 3, md: 5 },
        py: 3,
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        alignItems: { xs: 'flex-start', md: 'center' },
        justifyContent: 'space-between',
        gap: 3
      }}>
        {/* Left Side: Search Bar and Page Title */}
        <Stack direction="row" spacing={3} alignItems="center" flex={1} width="100%">
          <Typography variant="h5" sx={{ fontWeight: 600, color: colors.primary, whiteSpace: 'nowrap' }}>
            Ad Management
          </Typography>

          <TextField
            placeholder="Search ad configurations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ flex: 1, maxWidth: 400 }}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ color: colors.textMuted, fontSize: 20 }} /></InputAdornment>,
              sx: {
                borderRadius: '8px',
                bgcolor: colors.card,
                '& fieldset': { borderColor: colors.border, borderWidth: '1px' },
                '&:hover fieldset': { borderColor: colors.danger },
                fontSize: '0.9rem',
                color: colors.textMain
              }
            }}
          />
        </Stack>

        {/* Right Side: Global Status, Filters, Create */}
        <Stack direction="row" alignItems="center" spacing={2} width={{ xs: '100%', md: 'auto' }} justifyContent="flex-end">

          <Stack direction="row" alignItems="center" spacing={1} sx={{ bgcolor: colors.card, border: `1px solid ${colors.border}`, borderRadius: '8px', px: 2, height: 40 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 500, color: colors.textMuted }}>Universal Ad Toggle</Typography>
            <Switch
              checked={adsEnabled}
              onChange={handleGlobalAdsToggle}
              size="small"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { color: colors.primary },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: colors.primary },
              }}
            />
          </Stack>

          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filterPlatform}
              displayEmpty
              onChange={(e) => setFilterPlatform(e.target.value)}
              IconComponent={FilterListOutlined}
              sx={{
                borderRadius: '8px', bgcolor: colors.card,
                '& fieldset': { borderColor: colors.border },
                fontSize: '0.85rem', color: colors.textMain,
                height: 40
              }}
            >
              <MenuItem value=""><Typography sx={{ fontSize: '0.85rem' }}>All Tags</Typography></MenuItem>
              <MenuItem value="android"><Typography sx={{ fontSize: '0.85rem' }}>Android</Typography></MenuItem>
              <MenuItem value="ios"><Typography sx={{ fontSize: '0.85rem' }}>iOS</Typography></MenuItem>
              <MenuItem value="all"><Typography sx={{ fontSize: '0.85rem' }}>Cross-platform</Typography></MenuItem>
            </Select>
          </FormControl>

          <Button
            onClick={handleCreate}
            disableElevation
            startIcon={<AddOutlined sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: colors.primary,
              color: '#fff',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: '0.85rem',
              fontWeight: 500,
              height: 40,
              px: { xs: 2, md: 3 },
              '&:hover': { bgcolor: colors.hover }
            }}
          >
            Create
          </Button>
        </Stack>
      </Box>

      {/* Vertical List of Cards Area */}
      <Box sx={{ p: { xs: 3, md: 5 }, maxWidth: 1000, mx: 'auto' }}>
        <Stack spacing={3}>
          {loading ? (
            <Typography align="center" sx={{ color: colors.textMuted, mt: 4 }}>Loading...</Typography>
          ) : filtered.length === 0 ? (
            <Typography align="center" sx={{ color: colors.textMuted, mt: 4 }}>No cards found.</Typography>
          ) : (
            filtered.map((row) => {
              const isEditing = editingId === row._id;

              const formatColor =
                row.type.includes('banner') ? colors.blue :
                  row.type.includes('interstitial') ? colors.purple :
                    row.type.includes('reward') ? colors.orange : colors.primary;

              return (
                <Card
                  key={row._id}
                  elevation={0}
                  sx={{
                    borderRadius: '12px',
                    border: `1px solid ${colors.border}`,
                    bgcolor: colors.card,
                    position: 'relative',
                    transition: 'all 0.2s',
                    '& .action-buttons': { opacity: 0, transform: 'scale(0.95)', transition: 'all 0.2s' },
                    '&:hover': {
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                      bgcolor: colors.cardHover,
                      '& .action-buttons': { opacity: 1, transform: 'scale(1)' }
                    }
                  }}
                >
                  {isEditing ? (
                    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontWeight: 600, color: colors.primary }}>{row._id === 'new' ? 'Create New Card' : 'Edit Card Details'}</Typography>
                        <IconButton size="small" onClick={() => { if (row._id === 'new') { setAdTypes(adTypes.filter(a => a._id !== 'new')); }; cancelEdit(); }}><CloseOutlined fontSize="small" /></IconButton>
                      </Stack>

                      <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textMain, mb: 1 }}>Title</Typography>
                          <TextField fullWidth size="small" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} sx={{ '& fieldset': { borderRadius: '8px' } }} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textMain, mb: 1 }}>Description (Ad Unit ID)</Typography>
                          <TextField fullWidth size="small" value={editForm.ad_unit_id} onChange={(e) => setEditForm({ ...editForm, ad_unit_id: e.target.value })} sx={{ '& fieldset': { borderRadius: '8px' } }} />
                        </Grid>

                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textMain, mb: 1 }}>Tags (Platform)</Typography>
                          <FormControl fullWidth size="small" sx={{ '& fieldset': { borderRadius: '8px' } }}>
                            <Select value={editForm.platform} onChange={(e) => setEditForm({ ...editForm, platform: e.target.value })}>
                              {allowedPlatforms.map(p => <MenuItem key={p} value={p}>{p}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={6} sm={4}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textMain, mb: 1 }}>Format Badge</Typography>
                          <FormControl fullWidth size="small" sx={{ '& fieldset': { borderRadius: '8px' } }}>
                            <Select value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}>
                              {allowedTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: colors.textMain, mb: 1 }}>Status</Typography>
                          <FormControl fullWidth size="small" sx={{ '& fieldset': { borderRadius: '8px' } }}>
                            <Select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                              <MenuItem value="active">Active</MenuItem>
                              <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 1 }}>
                        <Button
                          variant="text"
                          onClick={() => { if (row._id === 'new') { setAdTypes(adTypes.filter(a => a._id !== 'new')); }; cancelEdit(); }}
                          sx={{ color: colors.textMuted, textTransform: 'none', fontWeight: 500 }}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          onClick={() => saveEdit(row._id === 'new' ? null : row.slug)}
                          disableElevation
                          sx={{ bgcolor: colors.primary, color: '#fff', '&:hover': { bgcolor: '#1e293b' }, textTransform: 'none', fontWeight: 500, px: 3, borderRadius: '8px' }}
                        >
                          Save changes
                        </Button>
                      </Stack>
                    </Box>
                  ) : (
                    <CardContent sx={{ p: '24px !important', display: 'flex', alignItems: 'center', gap: 3 }}>
                      {/* Left: Content Block */}
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center" mb={1}>
                          <Typography sx={{ fontWeight: 600, color: colors.textMain, fontSize: '1.05rem', lineHeight: 1.2 }}>
                            {row.name}
                          </Typography>
                          {/* Tags as Badges */}
                          <Chip
                            label={row.platform}
                            size="small"
                            sx={{ bgcolor: '#F3F4F6', color: '#374151', height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px', textTransform: 'capitalize' }}
                          />
                          <Chip
                            label={row.type.replace('_', ' ')}
                            size="small"
                            sx={{ bgcolor: `${formatColor}15`, color: formatColor, height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px', textTransform: 'capitalize' }}
                          />
                          {row.status === 'inactive' && (
                            <Chip label="Disabled" size="small" sx={{ bgcolor: `${colors.danger}15`, color: colors.danger, height: 20, fontSize: '0.7rem', fontWeight: 600, borderRadius: '4px' }} />
                          )}
                        </Stack>

                        {/* Description */}
                        <Typography sx={{ color: colors.textMuted, fontSize: '0.85rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {row.description || `ID: ${row.ad_unit_id}`}
                        </Typography>
                      </Box>

                      {/* Right: Stats and Actions */}
                      <Stack direction="row" alignItems="center" spacing={4}>
                        {/* View Count (Mock representation using impressions logic if it was available, or static display to match prompt) */}
                        <Box display="flex" alignItems="center" gap={1} sx={{ color: colors.textMuted }}>
                          <RemoveRedEyeOutlined sx={{ fontSize: 18 }} />
                          <Typography sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {row.status === 'active' ? 'Tracking' : '0'}
                          </Typography>
                        </Box>

                        {/* Action Buttons (Appear on hover via CSS classes defined above) */}
                        <Box className="action-buttons" sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Edit Card">
                            <IconButton
                              onClick={() => startEdit(row)}
                              sx={{ bgcolor: '#fff', border: `1px solid ${colors.border}`, '&:hover': { bgcolor: '#F3F4F6', color: colors.primary }, p: 1, borderRadius: '6px' }}
                            >
                              <EditOutlined fontSize="small" sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Card">
                            <IconButton
                              onClick={() => handleDelete(row.slug)}
                              sx={{ bgcolor: '#fff', border: `1px solid ${colors.border}`, color: colors.textMuted, '&:hover': { bgcolor: '#FEF2F2', color: colors.danger, borderColor: colors.danger }, p: 1, borderRadius: '6px' }}
                            >
                              <DeleteOutline fontSize="small" sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Stack>

                    </CardContent>
                  )}
                </Card>
              )
            })
          )}
        </Stack>
      </Box>
    </Box>
  );
}
