"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"
import { CiTrash } from "react-icons/ci";
import { FiUpload } from "react-icons/fi";
import { FaEye } from "react-icons/fa";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from "@dnd-kit/core"

import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy
} from "@dnd-kit/sortable"

import { CSS } from "@dnd-kit/utilities"

export default function ImageGallery() {
  const [images, setImages] = useState<string[]>([])
  const [dragActive, setDragActive] = useState(false)

  // --- Modal State ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = (img: string) => {
    setSelectedImage(img)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  // ---- DND Sensors ----
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ---- Drag End Handler ----
  const handleDragEnd = (event: any) => {
    const { active, over } = event
    if (!over) return

    if (active.id !== over.id) {
      setImages((prev) => {
        return arrayMove(prev, active.id, over.id)
      })
    }
  }

  // ---- Upload Handlers ----
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    processFiles(e.dataTransfer.files)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.currentTarget.files) {
      processFiles(e.currentTarget.files)
    }
  }

  const processFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          if (typeof e.target?.result === "string") {
            setImages((prev) => [...prev, e.target.result])
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const deleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold text-center py-4">
        Responsive Image Gallery with Upload, Preview & Drag-and-Drop
      </h1>

      {/* Upload Box */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`mb-8 border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary"
        }`}
      >
        <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" id="file-input" />
        <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
          <FiUpload className="w-8 h-8 text-muted-foreground" />
          <p className="text-lg font-medium">Drag and drop images here</p>
          <p className="text-sm text-muted-foreground">or click to select files</p>
        </label>
      </div>

      {/* Image Grid + Drag & Drop */}
      {images.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={images.map((_, index) => index)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <SortableImageCard
                  key={index}
                  id={index}
                  image={image}
                  index={index}
                  deleteImage={deleteImage}
                  openModal={openModal}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {images.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No images uploaded yet. Start by uploading or dragging images above.
          </p>
        </div>
      )}

      {/* ---------- IMAGE MODAL ---------- */}
      {isModalOpen && selectedImage && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] p-4"
          onClick={closeModal}
        >
          <div
            className="relative bg-white rounded-lg max-w-3xl w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-2 right-2 bg-black/70 text-white px-3 py-1 rounded"
              onClick={closeModal}
            >
              Close
            </button>

            <div className="relative w-full h-[70vh] bg-black">
              <Image
                src={selectedImage}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------------------------------------------
   SORTABLE IMAGE CARD COMPONENT
---------------------------------------------- */
function SortableImageCard({ id, image, index, deleteImage, openModal }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group overflow-hidden rounded-lg bg-muted aspect-square cursor-move"
      onClick={(e) => {
        e.stopPropagation()   // <-- prevents drag conflict
        openModal(image)
      }}
    >
      <Image
        src={image || "/placeholder.svg"}
        alt={`Uploaded image ${index + 1}`}
        fill
        className="object-cover w-full h-full"
      />

      <button
        onClick={(e) => {
          e.stopPropagation()  // prevents opening modal
          deleteImage(index)
        }}
        className="absolute top-2 right-2 p-1.5 bg-destructive/90 text-destructive-foreground rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-destructive cursor-pointer"
      >
        <CiTrash className="w-5 h-5" />
      </button>

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 pointer-events-none" />
    </div>
  )
}
