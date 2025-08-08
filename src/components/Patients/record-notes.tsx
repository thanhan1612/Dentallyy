"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash, MessageSquare } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { patientsService } from "@/api/patients";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { formatDateToDisplay } from "@/utils/date-utils";
import { LoadingScreen } from "@/components/LoadingScreen/loading-screen";
interface RecordNotesProps {
  record: any;
}

interface NoteFormValues {
  title: string;
  content: string;
}

const noteFormSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống"),
  content: z.string().min(1, "Nội dung không được để trống"),
});

const NoteCard = ({
  note,
  onDelete,
  onEdit,
  doctorName,
}: {
  note: any;
  onDelete: (id: string) => void;
  onEdit: (note: any) => void;
  doctorName: string;
}) => (
  <Card className="gap-1">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg">
          {note?.note_title || "Ghi chú y tế"}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {formatDateToDisplay(note?.createdTime)}
        </p>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-2">BS.{doctorName}</p>
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
);

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
  <Card>
    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
      <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground" />
      <p className="mb-2 text-lg font-medium">Không có ghi chú</p>
      <p className="mb-4 text-sm text-muted-foreground">
        Chưa có ghi chú nào được thêm vào hồ sơ này
      </p>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Thêm ghi chú
      </Button>
    </CardContent>
  </Card>
);

export function RecordNotes({ record }: RecordNotesProps) {
  const [showAddNoteDialog, setShowAddNoteDialog] = useState(false);
  const [notes, setNotes] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingNoteIndex, setEditingNoteIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (record?.doctor_notes) {
      const notes = (record?.doctor_notes || [])
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
  }, [record?.doctor_notes]);

  const handleDeleteNote = async (noteToDelete: any) => {
    const currentNotes = Array.isArray(record?.doctor_notes)
      ? record.doctor_notes
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
        n.note_title === noteToDelete.note_title &&
        n.note_content === noteToDelete.note_content
    );

    if (idx === -1) return;

    notesArr.splice(idx, 1);

    const updatedNotes = notesArr.map((n: any) => JSON.stringify(n));

    const payload = {
      doctor_notes: updatedNotes,
    };
    try {
      setIsLoading(true);
      await patientsService.updatePatientDocument(record?.$id, payload);
    } catch (error) {
      throw new Error("Error deleting note");
    } finally {
      setIsLoading(false);
      queryClient.refetchQueries({
        queryKey: ["patient-info", record?.$id],
      });
    }
  };

  const handleEditNote = (note: any) => {
    const notesArr = (record?.doctor_notes || [])
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
        n.note_title === note.note_title && n.note_content === note.note_content
    );
    setEditingNote(note);
    setEditingNoteIndex(idx);
    form.reset({
      title: note.note_title,
      content: note.note_content,
    });
    setShowAddNoteDialog(true);
  };

  const handleCreateNewNote = async (data: NoteFormValues) => {
    const currentNotes = Array.isArray(record?.doctor_notes)
      ? record.doctor_notes
      : [];
    const newNote = JSON.stringify({
      note_title: data.title,
      note_content: data.content,
    });
    const updatedNotes = [...currentNotes, newNote];
    const payload = {
      doctor_notes: updatedNotes,
    };
    await patientsService.updatePatientDocument(record?.$id, payload);
  };

  const handleUpdateNote = async (data: NoteFormValues) => {
    if (editingNoteIndex === null) return;

    const currentNotes = Array.isArray(record?.doctor_notes)
      ? record.doctor_notes
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

    notesArr[editingNoteIndex] = {
      ...notesArr[editingNoteIndex],
      note_title: data.title,
      note_content: data.content,
    };

    const updatedNotes = notesArr.map((n: any) => JSON.stringify(n));

    const payload = {
      doctor_notes: updatedNotes,
    };
    try {
      setIsLoading(true);
      await patientsService.updatePatientDocument(record?.$id, payload);
    } catch (error) {
      throw new Error("Error updating note");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNote = async (data: NoteFormValues) => {
    setIsLoading(true);
    try {
      setIsSaving(true);
      if (editingNote) {
        await handleUpdateNote(data);
      } else {
        await handleCreateNewNote(data);
      }

      queryClient.refetchQueries({
        queryKey: ["patient-info", record?.$id],
      });
      setShowAddNoteDialog(false);
      setEditingNote(null);
      form.reset();
    } catch (error) {
      throw new Error("Error saving note");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowAddNoteDialog(false);
    setEditingNote(null);
    form.reset();
  };

  const handleAddNote = () => {
    setEditingNote(null);
    form.reset({
      title: "",
      content: "",
    });
    setShowAddNoteDialog(true);
  };

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: editingNote?.note_title || "",
      content: editingNote?.note_content || "",
    },
  });

  if (isLoading) return <LoadingScreen />;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Ghi Chú Y Tế</h2>
        <Button onClick={handleAddNote}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm ghi chú
        </Button>
      </div>

      <div className="space-y-4">
        {notes.length > 0 ? (
          notes.map((note: any , index: number) => (
            <NoteCard
              key={index}
              note={note}
              onDelete={() => handleDeleteNote(note)}
              onEdit={handleEditNote}
              doctorName={record?.staffManagement?.[0]?.name}
            />
          ))
        ) : (
          <EmptyState onAdd={handleAddNote} />
        )}
      </div>

      <Dialog open={showAddNoteDialog} onOpenChange={handleCloseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingNote ? "Chỉnh Sửa Ghi Chú" : "Thêm Ghi Chú Mới"}
            </DialogTitle>
            <DialogDescription>
              {editingNote
                ? "Chỉnh sửa thông tin ghi chú"
                : "Thêm ghi chú mới vào hồ sơ bệnh án"}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSaveNote)}
              className="space-y-4"
            >
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
                        className="min-h-[150px]"
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
  );
}
