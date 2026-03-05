supabase
  .channel('equipment-updates')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'equipment' },
    () => {
      alert("Equipment Status Updated!");
      loadDashboard();
    }
  )
  .subscribe();
