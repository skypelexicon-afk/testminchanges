"use client";

import { fetchApi } from "@/lib/doFetch";
import { useDashboardStore } from "@/store/useAdminDataStore";
import { useState, useEffect, MouseEvent } from "react"
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Input } from "@/components/ui/input"
import Image from "next/image";
import { toast } from "sonner";


export default function CreateCombo() {
    const { allCourses, error, fetchDashboardData } = useDashboardStore();
    const { user, isAuthenticated, isLoading } = useAuthStore();
    const router = useRouter();

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    // Combo details
    const [courseIDList, setCourseIDList] = useState<number[]>([]);
    const [courseList, setCouseList] = useState<{ id: number, title: string, thumbnail: string }[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [price, setPrice] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discountLabel, setDiscountLabel] = useState("");

    // Add combo
    const handleAddCombo = async (e: MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        // Checks
        if (courseIDList.length === 0) {
            toast.error("Error: Course list is empty!");
            return;
        }
        if (title === "" || description === "" || thumbnail === "" || price === "" || originalPrice === "" || discountLabel === "") {
            toast.error("Error: All the fields must be filled!");
            return;
        }

        try {
            await fetchApi.post("api/bundle/", {
                title: title,
                description: description.replace(/\n/g, '<br/>'),
                hero_image: thumbnail,
                bundle_price: price,
                original_price: originalPrice,
                discount_label: discountLabel,
                courseIds: courseIDList,
            });
            toast.success("Combo created successfully.");
        } catch (err) {
            console.log("Combo creation error: ", err);
            toast.error("Combo creation failed!");
        } finally {
            setValue("");
            setCourseIDList([]);
            setCouseList([]);
            setTitle("");
            setDescription("");
            setThumbnail("");
            setPrice("");
            setOriginalPrice("");
            setDiscountLabel("");
        }
    }

    const handleAddCourse = () => {
        const selectedCourse = allCourses?.find((course) => course.title.trim() === value);
        if (selectedCourse && !courseIDList.includes(selectedCourse.id)) {
            setCourseIDList((prev) => [selectedCourse.id, ...prev]);
            setCouseList((prev) => [{ id: selectedCourse.id, title: selectedCourse.title, thumbnail: selectedCourse.image }, ...prev])
        }
    }

    const handleRemoveCourse = (id: number) => {
        setCourseIDList((prev) => prev.filter((c) => c !== id));
        setCouseList((prev) => prev.filter((c) => c.id !== id));
    }

    //  Auth guard
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/');
            } else if (user?.role !== 'super_admin') {
                router.push('/');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);


    useEffect(() => {
        if (!allCourses) {
            try {
                fetchDashboardData();
            } catch {
                console.log(error);
            }
        }
    }, [allCourses, fetchDashboardData]);

    if (isLoading) {
        return <div className="p-6 text-center">Checking authentication...</div>;
    }

    if (!isAuthenticated || user?.role !== 'super_admin') {
        return <div className="p-6 text-center">Unauthorized</div>;
    }

    return (
        <>
            <div>
                <p className="text-center my-10 text-2xl font-bold">Create combo courses</p>

                {/* Show the selected courses */}
                <div className="px-5 md:px-20 my-10">
                    {courseIDList.length !== 0 &&
                        <>
                            <p className="text-xl font-bold">Selected courses: </p>
                            <div className="flex flex-wrap gap-2 relative">
                                {courseList?.map((course) => (
                                    <div
                                        key={course.id}
                                        className="p-4 rounded-lg shadow-lg flex flex-col justify-between w-[200px] h-[300px]">
                                        <div>
                                            <Image
                                                src={course.thumbnail}
                                                alt="Course thumbnail"
                                                height={100}
                                                width={200}
                                                className="object-fill rounded-lg"
                                            />
                                            <p className="text-wrap mt-3">{course.title}</p>
                                        </div>

                                        <Button
                                            variant="destructive"
                                            className="hover:cursor-pointer self-end"
                                            onClick={() => handleRemoveCourse(course.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                ))}
                            </div>

                        </>
                    }
                </div>

                {/* Combobox to select course and add into combo */}
                <p className="text-center font-bold">Select course to add to combo:</p>
                <div className="w-full flex items-center justify-center gap-2">
                    <div className="my-4">
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild className="overflow-hidden">
                                <Button
                                    variant="outline"
                                    role="combobox"
                                    aria-expanded={open}
                                    className="w-[300px] justify-between"
                                >
                                    {value
                                        ? allCourses?.find((course) => course.title.trim() === value)?.title
                                        : "Select course..."}
                                    <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[300px] p-0">
                                <Command>
                                    <CommandInput placeholder="Search course..." />
                                    <CommandList>
                                        <CommandEmpty>No Course found.</CommandEmpty>
                                        <CommandGroup>
                                            {allCourses?.map((course) => (
                                                <CommandItem
                                                    key={course.id}
                                                    value={course.title}
                                                    onSelect={(currentValue) => {
                                                        setValue(currentValue === value ? "" : currentValue)
                                                        setOpen(false)
                                                    }}
                                                >
                                                    <CheckIcon
                                                        className={cn(
                                                            "mr-2 h-4 w-4",
                                                            value === course.title ? "opacity-100" : "opacity-0"
                                                        )}
                                                    />
                                                    {course.title}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button onClick={handleAddCourse}>Add</Button>
                </div>
                <div className="flex justify-center my-10">
                    <form className="w-11/12 md:w-1/2">
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend>Enter combo details</FieldLegend>
                                <FieldDescription>
                                    Enter all the required details.
                                </FieldDescription>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel htmlFor="combo-title">Combo title</FieldLabel>
                                        <Input
                                            id="combo-title"
                                            placeholder="1st Year combo..."
                                            required
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Combo description</FieldLabel>
                                        <RichTextEditor
                                            value={description}
                                            onChange={setDescription}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="combo-thumbnail">Combo thumbnail</FieldLabel>
                                        <Input
                                            id="combo-thumbnail"
                                            placeholder="Bunny CND image link"
                                            required
                                            value={thumbnail}
                                            onChange={(e) => setThumbnail(e.target.value)}
                                        />
                                    </Field>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Field>
                                            <FieldLabel htmlFor="combo-price">Combo price</FieldLabel>
                                            <Input
                                                id="combo-price"
                                                placeholder="499"
                                                required
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="original-price">Original price</FieldLabel>
                                            <Input
                                                id="original-price"
                                                placeholder="999"
                                                required
                                                value={originalPrice}
                                                onChange={(e) => setOriginalPrice(e.target.value)}
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel htmlFor="discount-label">Discount label</FieldLabel>
                                            <Input
                                                id="discount-label"
                                                placeholder="50%"
                                                required
                                                value={discountLabel}
                                                onChange={(e) => setDiscountLabel(e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                    <Field>
                                        <Button onClick={(e) => handleAddCombo(e)}>Add combo</Button>
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                    </form>
                </div>
            </div >
        </>
    )
}