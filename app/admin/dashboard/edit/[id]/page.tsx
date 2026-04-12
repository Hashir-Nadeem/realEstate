"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

type FormDataType = {
  propertyCategory: string;
  youAreHereTo: string;
  title: string;
  description: string;
  price: string;
  priceUnit: string;
  area: string;
  areaUnit: string;
  bedrooms: string;
  bathrooms: string;
  facing: string;
  floorNumber: string;
  totalFloors: string;
  fullAddress: string;
  city: string;
  locality: string;
  contactPersonName: string;
  email: string;
  whatsapp: string;
};

type PropertyResponse = {
  formData?: Partial<FormDataType>;
  location?: { lat: number; lng: number };
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    propertyCategory: "",
    youAreHereTo: "",
    title: "",
    description: "",
    price: "",
    priceUnit: "lac",
    area: "",
    areaUnit: "sqft",
    bedrooms: "",
    bathrooms: "",
    facing: "",
    floorNumber: "",
    totalFloors: "",
    fullAddress: "",
    city: "",
    locality: "",
    contactPersonName: "",
    email: "",
    whatsapp: "",
  });

  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const handleInputChange = (
    field: keyof FormDataType,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ AUTO FILL DATA
  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const res = await apiRequest<PropertyResponse>(
          `/properties/${id}`
        );

        const data = res?.formData ?? {};

        setFormData((prev) => ({
          ...prev,
          ...data,
          price: data.price?.toString() ?? "",
          area: data.area?.toString() ?? "",
        }));

        if (res?.location) {
          setSelectedLocation(res.location);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // ✅ SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        formData: {
          ...formData,
          price: Number(formData.price) || 0,
          area: Number(formData.area) || 0,
        },
        location: selectedLocation,
        updatedAt: new Date().toISOString(),
      };

      await apiRequest(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Updated");
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>

      <form onSubmit={handleSubmit} className="grid gap-4">

        {/* BASIC */}
        <input placeholder="Title" value={formData.title}
          onChange={(e) => handleInputChange("title", e.target.value)}
          className="border p-3 rounded" />

        <textarea placeholder="Description" value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="border p-3 rounded" />

        {/* CATEGORY */}
        <select value={formData.propertyCategory}
          onChange={(e) => handleInputChange("propertyCategory", e.target.value)}
          className="border p-3 rounded">
          <option value="">Select Category</option>
          <option value="residential">Residential</option>
          <option value="commercial">Commercial</option>
        </select>

        <select value={formData.youAreHereTo}
          onChange={(e) => handleInputChange("youAreHereTo", e.target.value)}
          className="border p-3 rounded">
          <option value="">Purpose</option>
          <option value="sell">Sell</option>
          <option value="rent">Rent</option>
        </select>

        {/* PRICE */}
        <div className="flex gap-2">
          <input type="number" placeholder="Price"
            value={formData.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            className="border p-3 rounded w-full" />

          <select value={formData.priceUnit}
            onChange={(e) => handleInputChange("priceUnit", e.target.value)}
            className="border p-3 rounded">
            <option value="lac">Lac</option>
            <option value="cr">Cr</option>
          </select>
        </div>

        {/* AREA */}
        <div className="flex gap-2">
          <input type="number" placeholder="Area"
            value={formData.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
            className="border p-3 rounded w-full" />

          <select value={formData.areaUnit}
            onChange={(e) => handleInputChange("areaUnit", e.target.value)}
            className="border p-3 rounded">
            <option value="sqft">sqft</option>
            <option value="sqm">sqm</option>
          </select>
        </div>

        {/* DETAILS */}
        <input placeholder="Bedrooms" value={formData.bedrooms}
          onChange={(e) => handleInputChange("bedrooms", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="Bathrooms" value={formData.bathrooms}
          onChange={(e) => handleInputChange("bathrooms", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="Facing" value={formData.facing}
          onChange={(e) => handleInputChange("facing", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="Floor Number" value={formData.floorNumber}
          onChange={(e) => handleInputChange("floorNumber", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="Total Floors" value={formData.totalFloors}
          onChange={(e) => handleInputChange("totalFloors", e.target.value)}
          className="border p-3 rounded" />

        {/* LOCATION */}
        <input placeholder="Full Address" value={formData.fullAddress}
          onChange={(e) => handleInputChange("fullAddress", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="City" value={formData.city}
          onChange={(e) => handleInputChange("city", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="Locality" value={formData.locality}
          onChange={(e) => handleInputChange("locality", e.target.value)}
          className="border p-3 rounded" />

        {/* CONTACT */}
        <input placeholder="Contact Name" value={formData.contactPersonName}
          onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="Email" value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          className="border p-3 rounded" />

        <input placeholder="WhatsApp" value={formData.whatsapp}
          onChange={(e) => handleInputChange("whatsapp", e.target.value)}
          className="border p-3 rounded" />

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-green-600 text-white p-3 rounded"
        >
          {isSubmitting ? "Updating..." : "Update Property"}
        </button>
      </form>
    </div>
  );
}