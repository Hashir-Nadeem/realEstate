"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiRequest } from "@/lib/api";

type FormDataType = {
  propertyCategory: string;
  transactionType: string;
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
  status: string;
};

type PropertyResponse = {
  propertyCategory?: string;
  transactionType?: string;
  youAreHereTo?: string;
  title?: string;
  description?: string;
  price?: number;
  priceUnit?: string;
  area?: number;
  areaUnit?: string;
  bedrooms?: string;
  bathrooms?: string;
  facing?: string;
  floorNumber?: string;
  totalFloors?: string;
  fullAddress?: string;
  city?: string;
  locality?: string;
  contactPersonName?: string;
  email?: string;
  whatsapp?: string;
  status?: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
};

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormDataType>({
    propertyCategory: "",
    transactionType: "",
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
    status: "Pending",
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

  useEffect(() => {
    if (!id) return;

    const fetchProperty = async () => {
      try {
        const res = await apiRequest<PropertyResponse>(
          `/properties/${id}`
        );

        setFormData((prev) => ({
          ...prev,
          ...res,
          price: res.price?.toString() ?? "",
          area: res.area?.toString() ?? "",
        }));

        if (res?.location?.coordinates) {
          setSelectedLocation({
            lat: res.location.coordinates[1],
            lng: res.location.coordinates[0],
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0,
        area: Number(formData.area) || 0,
        location: selectedLocation
          ? {
              type: "Point",
              coordinates: [
                selectedLocation.lng,
                selectedLocation.lat,
              ],
            }
          : null,
        updatedAt: new Date().toISOString(),
      };

      await apiRequest(`/properties/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      });

      alert("✅ Property Updated");
      router.push("/admin/dashboard");
    } catch (err) {
      console.error(err);
      alert("❌ Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Edit Property
          </h1>
          <p className="text-gray-500 mt-1">
            Update property details
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">

          <form onSubmit={handleSubmit} className="space-y-10">

            {/* BASIC */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Basic Information
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.propertyCategory}
                    onChange={(e) => handleInputChange("propertyCategory", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select</option>
                    <option value="residential">Residential</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                  <select
                    value={formData.transactionType}
                    onChange={(e) => handleInputChange("transactionType", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select</option>
                    <option value="new">New</option>
                    <option value="resale">Resale</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                  <select
                    value={formData.youAreHereTo}
                    onChange={(e) => handleInputChange("youAreHereTo", e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select</option>
                    <option value="sell">Sell</option>
                    <option value="rent">Rent</option>
                  </select>
                </div>

              </div>

              <div className="mt-5">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 h-28 focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* PRICE */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Pricing & Area
              </h2>

              <div className="grid md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleInputChange("price", e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                    />
                    <select
                      value={formData.priceUnit}
                      onChange={(e) => handleInputChange("priceUnit", e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="lac">Lac</option>
                      <option value="cr">Cr</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.area}
                      onChange={(e) => handleInputChange("area", e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                    />
                    <select
                      value={formData.areaUnit}
                      onChange={(e) => handleInputChange("areaUnit", e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2.5 focus:ring-2 focus:ring-green-500"
                    >
                      <option value="sqft">sqft</option>
                      <option value="sqm">sqm</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            {/* BUTTON */}
            <div className="flex justify-end border-t pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition"
              >
                {isSubmitting ? "Updating..." : "Update Property"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}