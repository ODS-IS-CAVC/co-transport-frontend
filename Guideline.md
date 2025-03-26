# Quy Trình Phát Triển Dự Án Sử Dụng SSR

## 0. Ví dụ Sử Dụng Các Component Common

- **File mẫu**: `src/app/component/page.tsx`
- **Hướng dẫn**: Tham khảo ví dụ tại [http://localhost:3000/component](http://localhost:3000/component).

## 1. Khởi Tạo Màn Hình Mới

- **Yêu cầu**:
  - Tạo mới page trong thư mục `src/app/(main-page)`, sử dụng SSR.
  - **Cấu trúc thư mục**:
    - Đối với các trang đơn giản:
      ```
      page
      ```
    - Đối với các trang có chức năng chi tiết, chỉnh sửa, cập nhật:
      ```
      page
      └── [id]
          └── page
      ```
- **Khởi tạo component**:
  - Đặt trong thư mục: `src/components/pages`.

## 2. Định Nghĩa Router và Menu (Breadcrumbs) Tương Ứng

- **Router**: Định nghĩa tại `src/constants/router/router.ts`.
- **Menu**: Định nghĩa tại `src/constants/router/menu.ts`.

## 3. Giao Diện (UI)

- **Quy tắc CSS**:

  - Sử dụng đơn vị **`rem`** thay vì `px`.
  - Toàn bộ dự án đã sử dụng font **Noto Sans**, không cần khai báo thêm.
  - Các mã màu chính đã được config trong `tailwind.config.ts`. Vui lòng sử dụng các giá trị đã định nghĩa.

- **Sử dụng Component Common**:

  - Tham khảo trong _sheet Common Component_.

- **Tận dụng UI từ thư viện**:

  - Link tài liệu: [NextUI Components](https://nextui.org/docs/components/).

- **Sử dụng Icon**:

  - Link tài liệu: [Google Material Icons](https://fonts.google.com/icons).

- **Sử dụng Logger**:
  - Link tài liệu: [Logger](https://github.com/winstonjs/winston).
  - Sử dụng Logger để log các thông tin và lỗi trong dự án.
  - Cách sử dụng:
    - Import Logger từ `src/utils/logger.ts`.
    - Sử dụng các phương thức `info`, `warn`, `error` để log thông tin, lỗi và cảnh báo.
    - Ví dụ:
      ```
      Logger.info({
        message: 'This is an info message',
        data: { someData: 'someValue' }
      });
      ```
