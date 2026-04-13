import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Review } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Star, ThumbsUp, CheckCircle, MessageSquare, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { mapReviewList, reviewsApi, roomsApi, usersApi } from '@/services/api';

const Reviews = () => {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: '', roomId: '' });
  const isClient = user?.role === 'CLIENT';
  const { data: clientUser } = useQuery({
    queryKey: ['userMe'],
    queryFn: usersApi.getMe,
    enabled: isClient,
  });
  const { data: roomsForForm = [] } = useQuery({
    queryKey: ['rooms', 'reviews-form'],
    queryFn: roomsApi.listRaw,
    enabled: isClient,
  });
  const { data, isLoading } = useQuery({
    queryKey: ['reviews', isClient, clientUser?.id],
    enabled: !isClient || !!clientUser?.id,
    queryFn: async () => {
      if (isClient && clientUser?.id) {
        const [reviews, rooms] = await Promise.all([
          reviewsApi.listByUser(String(clientUser.id)),
          roomsApi.listRaw(),
        ]);
        return reviews.map(review => {
          const room = rooms.find(r => r.id === review.roomId);
          const guestName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Guest';
          return {
            id: String(review.id),
            userId: String(review.userId),
            roomId: String(review.roomId),
            guestName,
            roomNumber: room?.roomNumber || '-',
            rating: review.rating,
            comment: review.comment || '',
            verified: !!review.verified,
            bookingId: review.bookingId ? String(review.bookingId) : '',
            helpful: 0,
            createdAt: review.createdAt || '',
          };
        });
      }
      const [reviews, rooms, users] = await Promise.all([
        reviewsApi.list(),
        roomsApi.listRaw(),
        usersApi.listRaw(),
      ]);
      return mapReviewList(reviews, rooms, users);
    },
  });

  const reviews = useMemo(() => data || [], [data]);
  const clientReviews = isClient ? reviews : reviews;
  
  const createReview = useMutation({
    mutationFn: (payload: any) => reviewsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      toast.success('Review submitted!');
      setModalOpen(false);
      setFormData({ rating: 5, comment: '', roomId: '' });
    },
  });

  const filtered = reviews.filter(r => {
    const ms = r.guestName.toLowerCase().includes(search.toLowerCase()) || r.roomNumber.includes(search);
    const mr = ratingFilter === 'ALL' || r.rating === Number(ratingFilter);
    return ms && mr;
  });

  const displayReviews = isClient ? clientReviews : filtered;
  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const countByRating = (n: number) => reviews.filter(r => r.rating === n).length;

  const handleSubmitReview = async () => {
    if (!formData.comment.trim()) {
      toast.error('Please enter a review');
      return;
    }
    if (!formData.roomId) {
      toast.error('Please select a room');
      return;
    }
    if (!clientUser?.id) {
      toast.error('User account not found. Please contact support.');
      return;
    }
    try {
      await createReview.mutateAsync({
        userId: Number(clientUser.id),
        roomId: Number(formData.roomId),
        rating: formData.rating,
        comment: formData.comment,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to submit review');
    }
  };

  return (
    <AppLayout breadcrumb={isClient ? "My Reviews" : "Reviews & Ratings"}>
      <div className="space-y-6 animate-fade-in">
        {/* Stats - Only show for non-clients */}
        {!isClient && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="metric-card text-center">
              <p className="text-3xl font-bold">{avg}</p>
              <div className="flex justify-center gap-0.5 my-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avg)) ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Average Rating</p>
            </div>
            <div className="metric-card text-center">
              <p className="text-3xl font-bold">{reviews.length}</p>
              <p className="text-xs text-muted-foreground mt-2">Total Reviews</p>
            </div>
            {[5, 4, 3].map(n => (
              <div key={n} className="metric-card text-center">
                <p className="text-2xl font-bold">{countByRating(n)}</p>
                <div className="flex justify-center gap-0.5 my-1">
                  {Array.from({ length: n }).map((_, i) => <Star key={i} className="w-3 h-3 text-accent fill-accent" />)}
                </div>
                <p className="text-xs text-muted-foreground">{n}-Star</p>
              </div>
            ))}
          </div>
        )}

        {/* Heading with Create button for CLIENT */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">{isClient ? 'My Reviews' : 'All Reviews'}</h2>
          {isClient && (
            <Button onClick={() => setModalOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Write Review
            </Button>
          )}
        </div>

        {/* Filters - Only for non-clients */}
        {!isClient && (
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by guest or room..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-[140px]"><SelectValue placeholder="Rating" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Ratings</SelectItem>
                {[5, 4, 3, 2, 1].map(n => <SelectItem key={n} value={String(n)}>{n} Stars</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {isLoading && <div className="text-sm text-muted-foreground">Loading reviews...</div>}

        {/* Reviews List */}
        <div className="space-y-4">
          {displayReviews.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-8">
              {isClient ? 'No reviews yet. Write your first review!' : 'No reviews found'}
            </div>
          )}
          {displayReviews.map(r => (
            <div key={r.id} className="bg-card rounded-xl border p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                    {r.guestName.split(' ').map(w => w[0]).join('')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{r.guestName}</span>
                      {r.verified && <span className="flex items-center gap-1 text-xs text-secondary"><CheckCircle className="w-3 h-3" /> Verified</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">Room {r.roomNumber} • {r.createdAt}</p>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-foreground">{r.comment}</p>
              {r.businessResponse && (
                <div className="bg-muted rounded-lg p-3 ml-4 border-l-2 border-secondary">
                  <p className="text-xs font-medium text-secondary flex items-center gap-1 mb-1"><MessageSquare className="w-3 h-3" /> Management Response</p>
                  <p className="text-sm text-muted-foreground">{r.businessResponse}</p>
                </div>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><ThumbsUp className="w-3 h-3" /> {r.helpful} found helpful</span>
                <span>Booking #{r.bookingId}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Review Dialog */}
      {isClient && (
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Write a Review</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Room</label>
                <Select value={formData.roomId} onValueChange={value => setFormData({ ...formData, roomId: value })}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select a room" /></SelectTrigger>
                  <SelectContent>
                    {roomsForForm.map(room => (
                      <SelectItem key={room.id} value={String(room.id)}>
                        Room {room.roomNumber}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Rating</label>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      onClick={() => setFormData({ ...formData, rating: n })}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${n <= formData.rating ? 'text-accent fill-accent' : 'text-muted-foreground'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Your Review</label>
                <Textarea
                  placeholder="Share your experience..."
                  value={formData.comment}
                  onChange={e => setFormData({ ...formData, comment: e.target.value })}
                  className="mt-2 h-24"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmitReview} disabled={createReview.isPending}>
                  {createReview.isPending ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
};

export default Reviews;
