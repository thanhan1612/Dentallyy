"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash, MessageSquare } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { treatmentService } from "@/api/treatment"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDateToDisplay } from "@/utils/date-utils"
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen"
import { v4 as uuidv4 } from 'uuid'

interface NoteFormValues {
  title: string
  content: string
}

const noteFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  content: z.string().min(1, "Nội dung không được để trống"),
})

const NoteCard = ({
  note,
  onDelete,
  onEdit,
}: {
  note: any;
  onDelete: (id: string) => void;
  onEdit: (note: any) => void;
}) => (
  <Card className="gap-3">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">{note?.note_title || "Ghi chú điều trị"}</CardTitle>
        <p className="text-sm text-muted-foreground">{formatDateToDisplay(note?.createdTime)}</p>
      </div>
      <CardDescription>BS.{note?.createdBy}</CardDescription>
    </CardHeader>
    <CardContent>
      <p className="text-sm">{note?.note_content}</p>
    </CardContent>
    <CardFooter className="flex justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => onEdit(note)}>
        <Edit className="mr-2 h-4 w-4" />
        Chỉnh sửa
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="text-destructive"
        onClick={() => onDelete(note?.id)}
      >
        <Trash className="mr-2 h-4 w-4" />
        Xóa
      </Button>
    </CardFooter>
  </Card>
)

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
      <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
      <p className="mb-2 text-lg font-medium">Không có ghi chú</p>
      <p className="mb-4 text-sm text-muted-foreground">Chưa có ghi chú nào được thêm vào điều trị này</p>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Thêm ghi chú
      </Button>
    </CardContent>
  </Card>
)

export function TreatmentNotes({ treatment }: any) {
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false)
  const [notes, setNotes] = useState<any[]>([])
  const [editingNote, setEditingNote] = useState<any | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    if (treatment?.treatment_notes) {
      const notes = (treatment?.treatment_notes || [])
        .map((str: any) => {
          try {
            return JSON.parse(str);
          } catch {
            return null;
          }
        })
        .filter(Boolean);
      setNotes(notes);
    }
  }, [treatment?.treatment_notes]);

  const handleDeleteNote = async (id: string) => {
    const currentNotes = Array.isArray(treatment?.treatment_notes)
      ? treatment?.treatment_notes
      : [];

    const notesArr = currentNotes
      .map((str: any) => {
        try {
          return JSON.parse(str);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    const idx = notesArr.findIndex(
      (n: any) =>
        n.id === id
    );

    if (idx === -1) return;

    notesArr.splice(idx, 1);

    const updatedNotes = notesArr.map((n: any) => JSON.stringify(n));

    const payload = {
      treatment_notes: updatedNotes,
    };
    try {
      setIsLoading(true);
      await treatmentService.updateTreatmentDocument(treatment?.$id, payload);
    } catch (error) {
      throw new Error("Error deleting note");
    } finally {
      setIsLoading(false);
      queryClient.refetchQueries({
        queryKey: ["treatment"],
      });
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    form.reset({
      title: note.note_title,
      content: note.note_content,
    });
    setShowAddNoteDialog(true);
  };

  const handleCreateNewNote = async (data: NoteFormValues) => {
    const currentNotes = Array.isArray(treatment?.treatment_notes)
      ? treatment?.treatment_notes
      : [];
    const newNote = JSON.stringify({
      id: uuidv4(),
      note_title: data.title,
      note_content: data.content,
      createdTime: new Date().toISOString(),
      createdBy: treatment?.staffManagement?.[0]?.name,
    });
    const updatedNotes = [...currentNotes, newNote];
    const payload = {
      treatment_notes: updatedNotes,
    };
    await treatmentService.updateTreatmentDocument(treatment?.$id, payload);
    setNotes(updatedNotes.map((str: any) => {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    }).filter(Boolean));
  };

  const handleUpdateNote = async (data: NoteFormValues) => {
    if (!editingNote) return;
    const currentNotes = Array.isArray(treatment?.treatment_notes)
      ? treatment?.treatment_notes
      : [];
    const idx = notes.findIndex((note) => note.id === editingNote.id);
    if (idx === -1) return;
    const updatedNote = JSON.stringify({
      ...editingNote,
      note_title: data.title,
      note_content: data.content,
    });
    const updatedNotesArr = [...currentNotes];
    updatedNotesArr[idx] = updatedNote;
    await treatmentService.updateTreatmentDocument(treatment?.$id, {
      treatment_notes: updatedNotesArr,
    });
    setNotes(updatedNotesArr.map((str: any) => {
      try {
        return JSON.parse(str);
      } catch {
        return null;
      }
    }).filter(Boolean));
  };

  const handleSaveNote = async (data: NoteFormValues) => {
    setIsLoading(true)
    try {
      setIsSaving(true)
      if (editingNote) {
        await handleUpdateNote(data)
      } else {
        await handleCreateNewNote(data)
      }
      
      queryClient.invalidateQueries({ queryKey: ["treatment"] })
      setShowAddNoteDialog(false)
      setEditingNote(null)
      form.reset()
    } catch (error) {
      throw new Error("Error saving note")
    } finally {
      setIsSaving(false)
      setIsLoading(false)
    }
  }

  const handleCloseDialog = () => {
    setShowAddNoteDialog(false)
    setEditingNote(null)
    form.reset()
  }

  const handleAddNote = () => {
    setEditingNote(null)
    form.reset({
      title: "",
      content: ""
    })
    setShowAddNoteDialog(true)
  }

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  })

  if (isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ghi Chú Điều Trị</h2>
        <Button onClick={handleAddNote}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm ghi chú
        </Button>
      </div>

      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note, idx) => (
            <NoteCard
              key={note.id || idx}
              note={note}
              onDelete={handleDeleteNote}
              onEdit={handleEditNote}
            />
          ))
        ) : (
          <EmptyState onAdd={handleAddNote} />
        )}
      </div>

      <Dialog open={showAddNoteDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingNote ? "Chỉnh Sửa Ghi Chú" : "Thêm Ghi Chú Mới"}</DialogTitle>
            <DialogDescription>
              {editingNote ? "Chỉnh sửa thông tin ghi chú" : "Thêm ghi chú mới vào điều trị"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSaveNote)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tiêu đề</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tiêu đề ghi chú" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nội dung</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Nhập nội dung ghi chú"
                        className="min-h-[100px]"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isSaving}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Đang lưu..." : editingNote ? "Cập nhật" : "Lưu"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
