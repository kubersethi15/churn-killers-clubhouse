-- Create analysis_groups table for flexible grouping
CREATE TABLE public.analysis_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add group_id to analyses table (nullable for ungrouped analyses)
ALTER TABLE public.analyses 
ADD COLUMN group_id UUID REFERENCES public.analysis_groups(id) ON DELETE SET NULL;

-- Enable RLS on analysis_groups
ALTER TABLE public.analysis_groups ENABLE ROW LEVEL SECURITY;

-- Create policies for analysis_groups
CREATE POLICY "Users can view their own groups"
ON public.analysis_groups
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own groups"
ON public.analysis_groups
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own groups"
ON public.analysis_groups
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own groups"
ON public.analysis_groups
FOR DELETE
USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_analyses_group_id ON public.analyses(group_id);
CREATE INDEX idx_analysis_groups_user_id ON public.analysis_groups(user_id);

-- Create trigger for updated_at on analysis_groups
CREATE TRIGGER update_analysis_groups_updated_at
BEFORE UPDATE ON public.analysis_groups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();