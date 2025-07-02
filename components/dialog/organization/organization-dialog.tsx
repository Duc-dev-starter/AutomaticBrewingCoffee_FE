"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EBaseStatus, EBaseStatusViMap } from "@/enum/base"
import { PlusCircle, Loader2, Edit, Upload, X, LinkIcon, ImageIcon, CheckCircle2, AlertCircle, Save, Zap, Monitor, Hash, Mail, Phone, Circle, Edit3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createOrganization, updateOrganization } from "@/services/organization"
import type { OrganizationDialogProps } from "@/types/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ErrorResponse } from "@/types/error"
import { organizationSchema } from "@/schema/organization"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { FormFooterActions } from "@/components/form"

const initialFormData = {
    name: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
    taxId: "",
    logoBase64: "",
    logoUrl: "",
    status: EBaseStatus.Active,
}

const OrganizationDialog = ({ open, onOpenChange, onSuccess, organization }: OrganizationDialogProps) => {
    const { toast } = useToast()
    const [errors, setErrors] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState(initialFormData)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(null)
    const [logoTab, setLogoTab] = useState<string>("upload")
    const [submitted, setSubmitted] = useState(false)
    const [validFields, setValidFields] = useState<Record<string, boolean>>({})
    const [focusedField, setFocusedField] = useState<string | null>(null)
    const nameInputRef = useRef<HTMLInputElement>(null)

    const isUpdate = !!organization

    useEffect(() => {
        if (organization) {
            setFormData({
                name: organization.name,
                description: organization.description || "",
                contactPhone: organization.contactPhone || "",
                contactEmail: organization.contactEmail || "",
                taxId: organization.taxId || "",
                status: organization.status,
                logoBase64: "",
                logoUrl: organization.logoUrl || "",
            })
            setLogoPreview(organization.logoUrl || null)
            setLogoFile(null)
            setLogoTab(organization.logoUrl ? "url" : "upload")
            setValidFields({
                name: organization.name.trim().length >= 1,
                taxId: organization.taxId?.trim().length >= 1,
                contactEmail: /\S+@\S+\.\S+/.test(organization.contactEmail || ""),
                contactPhone: organization.contactPhone?.trim().length >= 1,
            })
        } else {
            setFormData(initialFormData)
            setLogoPreview(null)
            setLogoFile(null)
            setLogoTab("upload")
            setValidFields({})
        }
    }, [organization, open])

    useEffect(() => {
        if (open && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 200)
        }
    }, [open])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!open) return
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault()
                handleSubmit(new Event("submit") as any)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [open, formData])

    const validateField = (field: string, value: string) => {
        const newValidFields = { ...validFields }
        switch (field) {
            case "name":
                newValidFields.name = value.trim().length >= 1
                break
            case "taxId":
                newValidFields.taxId = value.trim().length >= 1
                break
            case "contactEmail":
                newValidFields.contactEmail = /\S+@\S+\.\S+/.test(value)
                break
            case "contactPhone":
                newValidFields.contactPhone = value.trim().length >= 1
                break
        }
        setValidFields(newValidFields)
    }

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }))
        if (field === "name" || field === "taxId" || field === "contactEmail" || field === "contactPhone") {
            validateField(field, value)
        }
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }))
        }
    }

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith("image/")) {
            toast({
                title: "Lỗi",
                description: "Vui lòng chọn file hình ảnh",
                variant: "destructive",
            })
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast({
                title: "Lỗi",
                description: "Kích thước file không được vượt quá 2MB",
                variant: "destructive",
            })
            return
        }

        const previewUrl = URL.createObjectURL(file)
        setLogoPreview(previewUrl)
        setLogoFile(file)
        setFormData((prev) => ({
            ...prev,
            logoUrl: "",
        }))
    }

    const handleUrlChange = (url: string) => {
        setFormData((prev) => ({
            ...prev,
            logoUrl: url,
        }))
        setLogoPreview(url)
        setLogoFile(null)
    }

    const handleRemoveLogo = () => {
        setLogoPreview(null)
        setLogoFile(null)
        setFormData((prev) => ({
            ...prev,
            logoBase64: "",
            logoUrl: "",
        }))
    }

    const handleTestLogo = () => {
        if (!formData.logoUrl) {
            toast({
                title: "Lỗi",
                description: "Vui lòng nhập URL hình ảnh",
                variant: "destructive",
            })
            return
        }

        const img = new Image()
        img.onload = () => {
            setLogoPreview(formData.logoUrl)
            toast({
                title: "Thành công",
                description: "URL hình ảnh hợp lệ",
            })
        }
        img.onerror = () => {
            toast({
                title: "Lỗi",
                description: "URL hình ảnh không hợp lệ hoặc không thể truy cập",
                variant: "destructive",
            })
        }
        img.src = formData.logoUrl
    }

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => {
                const base64String = reader.result as string
                resolve(base64String)
            }
            reader.onerror = (error) => reject(error)
            reader.readAsDataURL(file)
        })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSubmitted(true)

        const validationResult = organizationSchema.safeParse(formData)
        if (!validationResult.success) {
            const { fieldErrors } = validationResult.error.flatten()
            setErrors(fieldErrors)
            return
        }

        setErrors({})
        setLoading(true)

        try {
            const payload: {
                name: string
                description: string
                contactPhone: string
                contactEmail: string
                logoBase64?: string
                logoUrl?: string
                taxId: string
                status: EBaseStatus
            } = {
                name: formData.name,
                description: formData.description,
                contactPhone: formData.contactPhone,
                contactEmail: formData.contactEmail,
                taxId: formData.taxId,
                status: formData.status,
            }

            if (logoTab === "upload" && logoFile) {
                const logoBase64 = await fileToBase64(logoFile)
                payload.logoBase64 = logoBase64
            } else if (logoTab === "url" && formData.logoUrl) {
                payload.logoUrl = formData.logoUrl
            }

            if (organization) {
                await updateOrganization(organization.organizationId, payload)
                toast({
                    title: "Thành công",
                    description: "Cập nhật tổ chức thành công",
                })
            } else {
                await createOrganization(payload)
                toast({
                    title: "Thành công",
                    description: "Thêm tổ chức mới thành công",
                })
            }
            onSuccess?.()
            onOpenChange(false)
        } catch (error) {
            const err = error as ErrorResponse
            console.error("Lỗi khi xử lý tổ chức:", error)
            toast({
                title: "Lỗi khi xử lý tổ chức",
                description: err.message,
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[650px] p-0 border-0 bg-white backdrop-blur-xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
                <div className="relative overflow-hidden bg-primary-100 rounded-tl-2xl rounded-tr-2xl">
                    <div className="relative px-8 py-6 border-b border-primary-300">
                        <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-gradient-to-r from-primary-400 to-primary-500 rounded-2xl flex items-center justify-center shadow-lg">
                                {isUpdate ? <Edit className="w-7 h-7 text-primary-100" /> : <PlusCircle className="w-7 h-7 text-primary-100" />}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                    {isUpdate ? "Cập nhật Tổ Chức" : "Tạo Tổ Chức Mới"}
                                </h1>
                                <p className="text-gray-500">{isUpdate ? "Chỉnh sửa thông tin tổ chức" : "Thêm tổ chức mới vào hệ thống"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-8 pt-2 space-y-8">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Logo tổ chức</Label>
                        <div className="flex items-start gap-4">
                            <Avatar className="h-16 w-16 rounded-md border">
                                <AvatarImage src={logoPreview || "/placeholder.svg"} alt="Logo Preview" />
                                <AvatarFallback className="rounded-md bg-primary text-primary-foreground text-xl">
                                    {formData.name ? formData.name.charAt(0).toUpperCase() : "L"}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <Tabs value={logoTab} onValueChange={setLogoTab} className="w-full">
                                    <TabsList className="grid grid-cols-2 mb-2">
                                        <TabsTrigger value="upload" disabled={loading}>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Tải lên
                                        </TabsTrigger>
                                        <TabsTrigger value="url" disabled={loading}>
                                            <LinkIcon className="h-4 w-4 mr-2" />
                                            URL
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="upload" className="space-y-2">
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" size="sm" className="relative" disabled={loading}>
                                                <input
                                                    id="logo"
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleLogoChange}
                                                    disabled={loading}
                                                />
                                                <Upload className="h-4 w-4 mr-1" />
                                                Chọn file
                                            </Button>
                                            {logoPreview && logoTab === "upload" && (
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={handleRemoveLogo}
                                                    disabled={loading}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    Xóa
                                                </Button>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground">Hỗ trợ JPG, PNG hoặc GIF. Tối đa 2MB.</p>
                                    </TabsContent>
                                    <TabsContent value="url" className="space-y-2">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Nhập URL hình ảnh"
                                                value={formData.logoUrl}
                                                onChange={(e) => handleUrlChange(e.target.value)}
                                                disabled={loading}
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleTestLogo}
                                                disabled={loading || !formData.logoUrl}
                                            >
                                                <ImageIcon className="h-4 w-4 mr-1" />
                                                Kiểm tra
                                            </Button>
                                        </div>
                                        {logoPreview && logoTab === "url" && (
                                            <Button type="button" variant="outline" size="sm" onClick={handleRemoveLogo} disabled={loading}>
                                                <X className="h-4 w-4 mr-1" />
                                                Xóa
                                            </Button>
                                        )}
                                        <p className="text-xs text-muted-foreground">Nhập URL hình ảnh từ internet.</p>
                                    </TabsContent>
                                </Tabs>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Monitor className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Tên Tổ Chức</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    ref={nameInputRef}
                                    placeholder="Nhập tên tổ chức"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                    onFocus={() => setFocusedField("name")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "name" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.name && "border-green-400 bg-green-50/50",
                                        !validFields.name && formData.name && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.name && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.name && formData.name && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.name && (
                                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Hash className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Mã Số Thuế</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập mã số thuế"
                                    value={formData.taxId}
                                    onChange={(e) => handleChange("taxId", e.target.value)}
                                    onFocus={() => setFocusedField("taxId")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "taxId" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.taxId && "border-green-400 bg-green-50/50",
                                        !validFields.taxId && formData.taxId && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.taxId && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.taxId && formData.taxId && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.taxId && (
                                <p className="text-red-500 text-xs mt-1">{errors.taxId}</p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Mail className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Email Liên Hệ</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    type="email"
                                    placeholder="Nhập email liên hệ"
                                    value={formData.contactEmail}
                                    onChange={(e) => handleChange("contactEmail", e.target.value)}
                                    onFocus={() => setFocusedField("contactEmail")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "contactEmail" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.contactEmail && "border-green-400 bg-green-50/50",
                                        !validFields.contactEmail && formData.contactEmail && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.contactEmail && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.contactEmail && formData.contactEmail && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.contactEmail && (
                                <p className="text-red-500 text-xs mt-1">{errors.contactEmail}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center space-x-2 mb-2">
                                <Phone className="w-4 h-4 text-primary-300" />
                                <label className="text-sm font-medium text-gray-700 asterisk">Số Điện Thoại</label>
                            </div>
                            <div className="relative group">
                                <Input
                                    placeholder="Nhập số điện thoại"
                                    value={formData.contactPhone}
                                    onChange={(e) => handleChange("contactPhone", e.target.value)}
                                    onFocus={() => setFocusedField("contactPhone")}
                                    onBlur={() => setFocusedField(null)}
                                    disabled={loading}
                                    className={cn(
                                        "h-12 text-base px-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm pr-10",
                                        focusedField === "contactPhone" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.02]",
                                        validFields.contactPhone && "border-green-400 bg-green-50/50",
                                        !validFields.contactPhone && formData.contactPhone && "border-red-300 bg-red-50/50"
                                    )}
                                />
                                {validFields.contactPhone && (
                                    <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500 animate-in zoom-in-50" />
                                )}
                                {!validFields.contactPhone && formData.contactPhone && (
                                    <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-red-400 animate-in zoom-in-50" />
                                )}
                            </div>
                            {submitted && errors.contactPhone && (
                                <p className="text-red-500 text-xs mt-1">{errors.contactPhone}</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Circle className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700 asterisk">Trạng Thái</label>
                        </div>
                        <Select
                            value={formData.status}
                            onValueChange={(value) => handleChange("status", value)}
                            disabled={loading}
                        >
                            <SelectTrigger className="h-12 text-sm px-4 border-2 bg-white/80 backdrop-blur-sm">
                                <SelectValue placeholder="Chọn trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.values(EBaseStatus).map((status) => (
                                    <SelectItem key={status} value={status}>
                                        {EBaseStatusViMap[status]}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {submitted && errors.status && (
                            <p className="text-red-500 text-xs mt-1">{errors.status}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                            <Edit3 className="w-4 h-4 text-primary-300" />
                            <label className="text-sm font-medium text-gray-700">Mô tả</label>
                        </div>
                        <div className="relative group">
                            <Textarea
                                placeholder="Nhập mô tả tổ chức"
                                value={formData.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                                onFocus={() => setFocusedField("description")}
                                onBlur={() => setFocusedField(null)}
                                disabled={loading}
                                className={cn(
                                    "min-h-[100px] text-base p-4 border-2 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none",
                                    focusedField === "description" && "border-primary-300 ring-4 ring-primary-100 shadow-lg scale-[1.01]"
                                )}
                            />
                        </div>
                        {submitted && errors.description && (
                            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
                        )}
                    </div>

                    <FormFooterActions
                        onCancel={() => onOpenChange(false)}
                        loading={loading}
                        isUpdate={isUpdate}
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default OrganizationDialog